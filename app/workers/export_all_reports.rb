class ExportAllReports
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(days_due, quarter, year, time_started)

    # # how many workers are running?
    # Sidekiq::Workers.new.size
    # # cancel all of them!
    # Sidekiq::Workers.new.each do |pid, tid, work|
    #   job_id = work['payload']['jid']
    #   Sidekiq.redis {|c| c.setex("cancelled-#{job_id}", 86400, 1) }
    # end

    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])

    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}/amount due")
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}/no amount due")

    reports = RoyaltyReport.includes(film: [:licensor], royalty_revenue_streams: [:revenue_stream]).where(quarter: quarter, year: year)
    reports.each do |report|
      return if Sidekiq.redis {|c| c.exists("cancelled-#{jid}") }
      if (days_due == "all" || report.film.days_statement_due == days_due.to_i) && report.film.export_reports
        p '---------------------------'
        p "#{report.film.title} (#{jid})"
        p '---------------------------'
        report.calculate!
        report.export!(time_started, bucket)
      end
    end

    files = Dir.glob("#{Rails.root}/tmp/#{time_started}/amount due/*.pdf")
    files2 = Dir.glob("#{Rails.root}/tmp/#{time_started}/no amount due/*.pdf")

    require 'zip'
    Zip::File.open(Rails.root.join('tmp', time_started, 'statements.zip'), Zip::File::CREATE) do |zip|
      files.each do |file|
        zip.add("amount due/#{file.split('/')[-1]}", file)
      end
      files2.each do |file|
        zip.add("no amount due/#{file.split('/')[-1]}", file)
      end
    end

    obj = bucket.object("#{time_started}/statements.zip")
    obj.upload_file(Rails.root.join('tmp', time_started, 'statements.zip'), acl:'private')
  end
end

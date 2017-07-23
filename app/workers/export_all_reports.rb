class ExportAllReports
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(days_due, quarter, year, time_started)

    # require 'sidekiq/api'
    # # how many workers are running?
    # Sidekiq::Workers.new.size
    # # cancel all of them!
    # Sidekiq::Workers.new.each do |pid, tid, work|
    #   job_id = work['payload']['jid']
    #   Sidekiq.redis {|c| c.setex("cancelled-#{job_id}", 86400, 1) }
    # end

    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}/amount due")
    FileUtils.mkdir_p("#{job_folder}/no amount due")
    job = Job.find_by_job_id(time_started)
    reports = RoyaltyReport.includes(film: [:licensor], royalty_revenue_streams: [:revenue_stream]).where(quarter: quarter, year: year, films: {export_reports: true, send_reports: true})
    reports.each do |report|
      return if Sidekiq.redis {|c| c.exists("cancelled-#{jid}") }
      if days_due == "all" || report.film.days_statement_due == days_due.to_i
        p '---------------------------'
        p "#{report.film.title} (#{jid})"
        p '---------------------------'
        report.calculate!
        save_path = report.joined_amount_due > 0 ? "#{job_folder}/amount due" : "#{job_folder}/no amount due"
        report.export!(save_path)
        job.update({current_value: job.current_value + 1})
      end
    end

    job.update({first_line: "Creating Archive", second_line: false})
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

    job.update({first_line: "Creating Archive", second_line: false})
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/statements.zip")
    obj.upload_file(Rails.root.join('tmp', time_started, 'statements.zip'), acl:'public-read')
    job.update!({done: true, first_line: obj.public_url})
  end
end

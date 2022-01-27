class ExportUncrossedReports
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(report_ids, time_started)

    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p(job_folder)
    job = Job.find_by_job_id(time_started)
    reports = RoyaltyReport.includes(:film).where(id: report_ids)

    reports.each do |report|
      return if Sidekiq.redis { |c| c.exists("cancelled-#{jid}") }
      return if job.reload.status = :killed
      p '---------------------------'
      p "#{report.film.title} (#{jid})"
      p '---------------------------'
      royalty_revenue_streams = report.royalty_revenue_streams
      report.export(directory: job_folder, royalty_revenue_streams: royalty_revenue_streams)
      job.update({ current_value: job.current_value + 1 })
    end

    job.update({ first_line: "Creating Archive", second_line: false })
    files = Dir.glob("#{Rails.root}/tmp/#{time_started}/*.pdf")
    require 'zip'
    Zip::File.open(Rails.root.join('tmp', time_started, 'statements.zip'), Zip::File::CREATE) do |zip|
      files.each do |file|
        zip.add(file.split('/')[-1], file)
      end
    end

    job.update({first_line: "Uploading to AWS", second_line: false})
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/statements.zip")
    obj.upload_file(Rails.root.join('tmp', time_started, 'statements.zip'), acl:'public-read')
    job.update!({ status: :success, metadata: { url: obj.public_url } })
  end
end

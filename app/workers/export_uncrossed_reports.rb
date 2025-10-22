class ExportUncrossedReports
  include Sidekiq::Worker
  include AwsUpload

  sidekiq_options retry: false

  def perform(report_ids, time_started)

    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p(job_folder)
    job = Job.find_by_job_id(time_started)
    reports = RoyaltyReport.includes(:film).where(id: report_ids)

    reports.each do |report|
      return if job.reload.status == "killed"
      p '---------------------------'
      p "#{report.film.title}"
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
    public_url = upload_to_aws(file_path: Rails.root.join('tmp', time_started, 'statements.zip'), key: "#{time_started}/statements.zip")

    job.update!({ status: :success, metadata: { url: public_url } })
  end
end

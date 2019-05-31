class Api::ConvertController < AdminController

  def import
    uploaded_io = params[:user][:spreadsheet]
    original_filename = uploaded_io.original_filename
    time_started = Time.now.to_s
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    File.open(Rails.root.join('tmp', time_started, original_filename), 'wb') do |file|
      file.write(uploaded_io.read)
    end
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/#{original_filename}")
    obj.upload_file(Rails.root.join('tmp', time_started, original_filename), acl:'private')
    job = Job.create!(job_id: time_started, first_line: "Importing Sales Report", second_line: false)
    ConvertSalesData.perform_async(time_started, original_filename)
    redirect_to "/convert", flash: { job_id: job.id }
  end

end

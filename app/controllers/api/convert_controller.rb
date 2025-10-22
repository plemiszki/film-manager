class Api::ConvertController < AdminController

  include AwsUpload

  def import
    uploaded_io = params[:user][:spreadsheet]
    digital_retailer_id = params[:user][:digital_retailer_id]
    date = params[:user][:date]
    invoice_number = params[:user][:invoice_number]
    original_filename = uploaded_io.original_filename
    time_started = Time.now.to_s
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    File.open(Rails.root.join('tmp', time_started, original_filename), 'wb') do |file|
      file.write(uploaded_io.read)
    end

    upload_to_aws(file_path: Rails.root.join('tmp', time_started, original_filename), key: "#{time_started}/#{original_filename}")

    job = Job.create!(job_id: time_started, first_line: "Importing Sales Report", second_line: false)
    ConvertSalesData.perform_async(time_started, original_filename, digital_retailer_id, date, invoice_number)
    redirect_to "/convert", flash: { job_id: job.id }
  end

end

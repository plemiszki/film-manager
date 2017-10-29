class ImportInventory
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(time_started, original_filename)
    p '---------------------------'
    p 'STARTING INVENTORY IMPORT'
    p '---------------------------'
    job = Job.find_by_job_id(time_started)
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    object = s3.bucket(ENV['S3_BUCKET']).object("#{time_started}/#{original_filename}")
    object.get(response_target: Rails.root.join("tmp/#{time_started}/#{original_filename}"))

    require 'roo'
    begin
      xls = Roo::Spreadsheet.open(Rails.root.join("tmp/#{time_started}/#{original_filename}").to_s, extension: :xls)
      sheet = xls.sheet(0)
      index = 5
      errors = []
      job.update!(first_line: "Updating Stock", second_line: true, current_value: 0, total_value: xls.last_row)
      dvds = Dvd.all.includes(:feature)
      while index <= xls.last_row
        columns = sheet.row(index)
        upc, qty = columns[1], columns[4]
        dvd = dvds.find_by_upc(upc)
        if dvd
          dvd.update(stock: qty)
        end
        index += 1
        job.update!(current_value: index)
      end
      job.update!({ done: true, first_line: "Import Complete", errors_text: errors.join("\n") })
      p '---------------------------'
      p 'FINISHED INVENTORY IMPORT'
      p '---------------------------'
    rescue
      job.update!({ done: true, errors_text: "Unable to import spreadsheet" })
    end
  end

end

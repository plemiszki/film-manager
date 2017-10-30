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
          before_qty = dvd.stock
          difference = qty.to_i - before_qty
          errors << "(#{difference > 0 ? "+" : ""}#{difference}) #{dvd.feature.title} - #{dvd.dvd_type.name}" unless difference == 0
          dvd.update(stock: qty)
        end
        index += 1
        job.update!(current_value: index)
      end
      errors.sort! do |a, b|
        a_num = a[/^\([\+\-\d]+\)/].gsub(/[\(\)]/, '').to_i
        b_num = b[/^\([\+\-\d]+\)/].gsub(/[\(\)]/, '').to_i
        case
        when a_num <= b_num
          1
        when a_num > b_num
          -1
        end
      end
      job.update!({ done: true, first_line: errors.empty? ? "Import complete.\nThere were no changes." : "Stock Updated", errors_text: errors.join("\n") })
      p '---------------------------'
      p 'FINISHED INVENTORY IMPORT'
      p '---------------------------'
    rescue
      job.update!({ done: true, first_line: "Oops. There were some errors.", errors_text: "Unable to import spreadsheet" })
    end
  end

end

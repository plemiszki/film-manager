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
      dvds_check_object = {}
      dvds.each do |dvd|
        dvds_check_object[dvd.id] = false
      end
      giftboxes = Giftbox.all
      giftboxes_check_object = {}
      giftboxes.each do |giftbox|
        giftboxes_check_object[giftbox.id] = false
      end
      while index <= xls.last_row
        columns = sheet.row(index)
        upc, qty = columns[1], columns[4]
        dvd = dvds.find_by_upc(upc)
        if dvd
          dvds_check_object[dvd.id] = true
          before_qty = dvd.stock
          difference = qty.to_i - before_qty
          errors << "(#{difference > 0 ? "+" : ""}#{difference}) #{dvd.feature.title} - #{dvd.dvd_type.name}#{difference > 0 ? " :)" : ""}" unless difference == 0
          dvd.update(stock: qty)
        else
          giftbox = giftboxes.find_by_upc(upc)
          if giftbox
            giftboxes_check_object[giftbox.id] = true
            before_qty = giftbox.quantity
            difference = qty.to_i - before_qty
            errors << "(#{difference > 0 ? "+" : ""}#{difference}) #{giftbox.name}#{difference > 0 ? " :)" : ""}" unless difference == 0
            giftbox.update(quantity: qty)
          end
        end
        index += 1
        job.update!(current_value: index)
      end
      missing_dvd_ids = dvds_check_object.select { |key, value| value == false }.keys
      Dvd.where(id: missing_dvd_ids).update_all(stock: 0)
      missing_giftbox_ids = giftboxes_check_object.select { |key, value| value == false }.keys
      Giftbox.where(id: missing_giftbox_ids).update_all(quantity: 0)
      errors.sort! do |a, b|
        a_num = a[/^\([\+\-\d]+\)/].gsub(/[\(\)]/, '').to_i.abs
        b_num = b[/^\([\+\-\d]+\)/].gsub(/[\(\)]/, '').to_i.abs
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

# Columns: Film, GL Code, Amount

class ConvertSalesData
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(time_started, original_filename)
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p(job_folder)

    # read from uploaded file
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    object = s3.bucket(ENV['S3_BUCKET']).object("#{time_started}/#{original_filename}")
    object.get(response_target: Rails.root.join("tmp/#{time_started}/#{original_filename}"))
    require 'roo'
    # begin
      xlsx = Roo::Spreadsheet.open(Rails.root.join("tmp/#{time_started}/#{original_filename}").to_s)
      sheet = xlsx.sheet(0)
      index = 2
      errors = []
      job.update!(first_line: "Importing Sales Report", second_line: true, current_value: 0, total_value: xlsx.last_row)
      totals = Hash.new { |hash, key| hash[key] = Hash.new(0) }
      unknown_films = []
      while index <= xlsx.last_row
        columns = sheet.row(index)
        title = columns[0]
        # TODO: remove this before deploying:
        if title.to_s.downcase.include?('total')
          index += 1
          next
        end
        title = title.to_s.gsub('(English Subtitled)', '').strip
        film = Film.where('lower(title) = ?', title.to_s.downcase).first
        if film
          code = columns[1]
          amount = (columns[2].to_f.round(2) * 100).to_i
          totals[film.get_sage_id][code] += amount
        else
          a = Alias.where('lower(text) = ?', title.to_s.downcase).first
          if a
            film = a.film
            code = columns[1]
            amount = (columns[2].to_f.round(2) * 100).to_i
            totals[film.get_sage_id][code] += amount
          else
            unknown_films << title
          end
        end
        index += 1
        job.update!(current_value: index)
      end

      # write to new file
      require 'xlsx_writer'
      doc = XlsxWriter.new
      sheet = doc.add_sheet("Sales")
      sheet.add_row([
        "Sage ID",
        "GL Code",
        "Amount"
      ])

      job.update!(first_line: "Exporting Combined Sales", second_line: true, current_value: 0, total_value: totals.keys.length)
      totals.each do |sage_id, value|
        value.each do |gl_code, amount|
          sheet.add_row([sage_id, gl_code, amount.fdiv(100)])
          job.update!(current_value: index)
        end
      end

      file_path = "#{job_folder}/sales.xlsx"
      FileUtils.mv doc.path, file_path
      doc.cleanup

      job.update({ first_line: "Uploading to AWS", second_line: false })
      s3 = Aws::S3::Resource.new(
        credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
        region: 'us-east-1'
      )
      bucket = s3.bucket(ENV['S3_BUCKET'])
      obj = bucket.object("#{time_started}/sales.xlsx")
      obj.upload_file(file_path, acl:'public-read')

      if unknown_films.present?
        job.update!({ done: true, errors_text: unknown_films.sort.uniq.to_json })
      else
        job.update!({ done: true, first_line: obj.public_url })
      end

    # rescue
    #   job.update!({ done: true, errors_text: "Unable to convert spreadsheet" })
    # end
  end
end

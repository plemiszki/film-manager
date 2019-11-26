# Columns: Film, GL Code, _ , Amount

class ImportSageData
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(year, quarter, time_started, label, original_filename)
    p '---------------------------'
    p 'STARTING SAGE IMPORT'
    p '---------------------------'
    job = Job.find_by_job_id(time_started)
    reports = RoyaltyReport.where(year: year, quarter: quarter)
    # create royalty_revenue_streams if we haven't seen this quarter before
    if reports.length == 0
      films = Film.where(film_type: ['Feature', 'TV Series'])
      job.update!(first_line: "Transferring Previous Revenue/Expenses", second_line: true, current_value: 0, total_value: films.length)
      films.each_with_index do |film, index|
        next if film.ignore_sage_id
        prev_report, prev_streams = get_prev_report(film, quarter.to_i, year.to_i)
        report = RoyaltyReport.new(film_id: film.id, deal_id: film.deal_type_id, quarter: quarter, year: year, mg: film.mg, e_and_o: film.e_and_o)
        if prev_report
          prev_amount_due = (prev_report.joined_amount_due < 0 ? 0 : prev_report.joined_amount_due)
          report.amount_paid = (prev_report.amount_paid + prev_amount_due)
          report.cume_total_expenses = prev_report.joined_total_expenses
        end
        report.save!
        prev_report_streams = prev_report.royalty_revenue_streams if prev_report
        FilmRevenuePercentage.where(film_id: film.id).joins(:revenue_stream).order('revenue_streams.order').each_with_index do |film_revenue_percentage, index|
          RoyaltyRevenueStream.create(royalty_report_id: report.id, revenue_stream_id: film_revenue_percentage.revenue_stream_id, licensor_percentage: film_revenue_percentage.value, cume_revenue: prev_report ? prev_report_streams[index].joined_revenue : 0, cume_expense: prev_report ? prev_report_streams[index].joined_expense : 0)
        end
        job.update!(current_value: index, total_value: films.length)
      end
    else
      if label == "revenue"
        ActiveRecord::Base.connection.execute("UPDATE royalty_revenue_streams SET current_revenue = 0 FROM royalty_reports WHERE royalty_reports.id = royalty_revenue_streams.royalty_report_id AND royalty_reports.year = #{year} AND royalty_reports.quarter = #{quarter}")
      elsif label == "expenses"
        ActiveRecord::Base.connection.execute("UPDATE royalty_revenue_streams SET current_expense = 0 FROM royalty_reports WHERE royalty_reports.id = royalty_revenue_streams.royalty_report_id AND royalty_reports.year = #{year} AND royalty_reports.quarter = #{quarter}")
        ActiveRecord::Base.connection.execute("UPDATE royalty_reports SET current_total_expenses = 0 WHERE royalty_reports.year = #{year} AND royalty_reports.quarter = #{quarter}")
      end
    end
    # now start importing from the file
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    object = s3.bucket(ENV['S3_BUCKET']).object("#{time_started}/#{original_filename}")
    object.get(response_target: Rails.root.join("tmp/#{time_started}/#{original_filename}"))

    require 'roo'
    begin
      xlsx = Roo::Spreadsheet.open(Rails.root.join("tmp/#{time_started}/#{original_filename}").to_s)
      sheet = xlsx.sheet(0)
      index = 2
      errors = []
      job.update!(first_line: "Importing #{label.capitalize} From Spreadsheet", second_line: true, current_value: 0, total_value: xlsx.last_row)
      while index <= xlsx.last_row
        columns = sheet.row(index)
        found_film = false
        found_box_set = false
        films = Film.where("film_type IN ('Feature', 'TV Series') AND ignore_sage_id = FALSE AND LOWER(films.sage_id) = LOWER('#{columns[0].gsub("'", "''")}')")
        if films.length > 0
          found_film = true
        else
          films = Film.where("film_type IN ('Feature', 'TV Series') AND ignore_sage_id = FALSE AND LOWER(films.title) = LOWER('#{columns[0].gsub("'", "''")}')")
          if films.length > 0
            found_film = true
          else
            giftboxes = Giftbox.where("LOWER(giftboxes.sage_id) = LOWER('#{columns[0].gsub("'", "''")}')")
            if giftboxes.length > 0
              code = columns[1]
              if code.starts_with?('3') && code != '30200'
                errors << "Only video revenue is accepted from box set Sage IDs. (Row #{index})"
              else
                found_box_set = true
              end
            else
              errors << "Sage ID #{columns[0]} not found. (Row #{index})"
            end
          end
        end

        if found_box_set
          giftbox = giftboxes[0]
          dvds = giftbox.dvds.includes(:feature)
          amount = (columns[3].to_d / dvds.length).truncate(2)
          dvds.each do |dvd|
            film = dvd.feature
            report = RoyaltyReport.find_by(film_id: film.id, quarter: quarter, year: year)
            if label == "revenue"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
              stream.current_revenue += amount
              stream.save!
            else
              gl = columns[1]
              apply_expense(film, label, gl, report, amount, errors)
            end
          end
        end

        if found_film
          film = films[0]
          report = RoyaltyReport.find_by(film_id: film.id, quarter: quarter, year: year)
          gl = columns[1]

          if label == "revenue"
            case gl
            when "30100"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 1)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30200"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30300"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 13)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30350"
              if FilmRight.find_by(film_id: film.id, right_id: 17) && FilmRevenuePercentage.find_by({ film_id: film.id, revenue_stream_id: 13 }).value > 0
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 13)
                stream.current_revenue += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, label)
              else
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 6)
                stream.current_revenue += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, label)
              end
            when "30410"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 2)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30430"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 2)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30440"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 2)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30400"
              if FilmRight.find_by(film_id: film.id, right_id: 2)
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 2)
                stream.current_revenue += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, label)
              else
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
                stream.current_revenue += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, label)
              end
            when "30415"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 4)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30420"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 4)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30500"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 6)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30510"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 8)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30520"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30600"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 12)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30700"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 7)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30800"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 11)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when "30900"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 11)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, label)
            when nil
              errors << "GL Code is empty on line #{index}"
            else
              errors << "GL Code #{columns[1]} not found."
            end
          elsif label == "expenses"
            apply_expense(film, label, gl, report, columns[3], errors)
          end
        end

        index += 1
        job.update!(current_value: index)
      end
      job.update!({ done: true, first_line: "Import Complete", errors_text: errors.join("\n") })
      p '---------------------------'
      p 'FINISHED SAGE IMPORT'
      p '---------------------------'
    rescue
      job.update!({ done: true, errors_text: "Unable to import spreadsheet" })
    end
  end

  def apply_expense(film, label, gl, report, amount, errors)
    if film.deal_type_id == 2 || film.deal_type_id == 3 || film.deal_type_id == 5 || film.deal_type_id == 6
      if (FilmRight.find_by(film_id: film.id, right_id: 13) || FilmRight.find_by(film_id: film.id, right_id: 14) || FilmRight.find_by(film_id: film.id, right_id: 15)) && !FilmRight.find_by(film_id: film.id, right_id: 1) && !FilmRight.find_by(film_id: film.id, right_id: 2) && !FilmRight.find_by(film_id: film.id, right_id: 12) && !FilmRight.find_by(film_id: film.id, right_id: 5) && !FilmRight.find_by(film_id: film.id, right_id: 6) && !FilmRight.find_by(film_id: film.id, right_id: 10) && !FilmRight.find_by(film_id: film.id, right_id: 11) && !FilmRight.find_by(film_id: film.id, right_id: 8) && !FilmRight.find_by(film_id: film.id, right_id: 9)
        stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 11)
        stream.current_expense += amount
        stream.save!
        check_for_empty_percentage(stream, errors, film.title, label)
      elsif gl == "50400"
        unless film.deal_type_id == 3
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 11)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        end
      elsif gl == "50200"
        unless film.deal_type_id == 3
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 13)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        end
      elsif gl == "40070" || gl == "50300"
        unless film.deal_type_id == 3
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 2)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        end
      elsif gl == "50360" || gl == "48200"
        unless film.deal_type_id == 3
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        end
      elsif gl == "50110" || gl == "40041" || gl == "40064" || gl == "40063" || gl == "40051" || gl == "50111" || gl == "40042" || gl == "50112" || gl == "40061"
        unless film.deal_type_id == 3
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        end
      elsif gl == "40092" || gl == "50105" || gl == "50101" || gl == "40086" || gl == "50102" || gl == "50103" || gl == "40078" || gl == "40080" || gl == "50104"
        stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 1)
        stream.current_expense += amount
        stream.save!
        check_for_empty_percentage(stream, errors, film.title, label)
      elsif gl == "47000"
        unless film.deal_type_id == 3
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 12)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        end
      elsif gl == "61110" || gl == "63104" || gl == "64101" || gl == "63114" || gl == "61140" || gl == "63103" || gl == "61120" || gl == "64100" || gl == "64103" || gl == "69111" || gl == "69113" || gl == "60200" || gl == "60400" || gl == "60300" || gl == "63110" || gl == "63120" || gl == "69109" || gl == "63105" || gl == "61100" || gl == "61160" || gl == "63111" || gl == "63106" || gl == "63118" || gl == "63107" || gl == "63112" || gl == "67160" || gl == "63119" || gl == "65101" || gl == "69110" || gl == "60100" || gl == "40071" || gl == "64104" || gl == "61150" || gl == "63116" || gl == "69100" || gl == "69112" || gl == "69101" || gl == "69102"
        if FilmRight.find_by(film_id: film.id, right_id: 1)
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 1)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        else
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 7)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        end
      elsif gl == "50500" || gl == "40021"
        unless film.deal_type_id == 3
          if FilmRight.find_by(film_id: film.id, right_id: 6)
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 7)
            stream.current_expense += amount
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, label)
          else
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
            stream.current_expense += amount
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, label)
          end
        end
      elsif gl == "40031"
        unless film.deal_type_id == 3
          if FilmRight.find_by(film_id: film.id, right_id: 12)
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
            stream.current_expense += amount
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, label)
          else
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 7)
            stream.current_expense += amount
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, label)
          end
        end
      elsif gl == "40040"
        if FilmRight.find_by(film_id: film.id, right_id: 1)
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 1)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        elsif FilmRight.find_by(film_id: film.id, right_id: 7)
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        else
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        end
      elsif gl == "40011" || gl == "48000" || gl == "50350"
        unless film.deal_type_id == 3
          if FilmRight.find_by(film_id: film.id, right_id: 6)
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 7)
            stream.current_expense += amount
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, label)
          else
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
            stream.current_expense += amount
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, label)
          end
        end
      elsif gl == "48100"
        unless film.deal_type_id == 3
          if FilmRight.find_by(film_id: film.id, right_id: 7)
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
            stream.current_expense += amount
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, label)
          else
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 7)
            stream.current_expense += amount
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, label)
          end
        end
      elsif gl == "40090"
        unless film.deal_type_id == 3
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 2)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        end
      elsif gl == "50250" || gl == "50260"
        if FilmRight.find_by(film_id: film.id, right_id: 17) && FilmRevenuePercentage.find_by({ film_id: film.id, revenue_stream_id: 13 }).value > 0
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 13)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        else
          stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 6)
          stream.current_expense += amount
          stream.save!
          check_for_empty_percentage(stream, errors, film.title, label)
        end
      elsif gl == nil
        errors << "GL Code is empty on line #{index}"
      else
        errors << "GL Code #{gl} not found."
      end
    elsif film.deal_type_id == 4
      report.current_total_expenses += amount
      report.save!
    end
  end

  def get_prev_report(film, quarter, year)
    prev_quarter = quarter - 1
    prev_year = year
    if prev_quarter == 0
      prev_quarter = 4
      prev_year -= 1
    end
    @reports = RoyaltyReport.where(film_id: film.id, year: prev_year, quarter: prev_quarter)
    return nil if @reports.empty?
    @film = film
    @streams = RoyaltyRevenueStream.where(royalty_report_id: @reports[0].id).joins(:revenue_stream).order('revenue_streams.order')
    @reports[0].calculate!
    return [@reports[0], @streams]
  end

  def check_for_empty_percentage(stream, errors, title, label)
    if stream.licensor_percentage == 0
      rev_stream = RevenueStream.find(stream.revenue_stream_id)
      stream_name = rev_stream.nickname || rev_stream.name
      message = "#{label.capitalize} #{label == 'revenue' ? 'was' : 'were'} added to #{stream_name} for \"#{title}\", but percentage is zero."
      errors << message unless errors.include?(message)
    end
  end
end

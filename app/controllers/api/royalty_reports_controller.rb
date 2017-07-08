class Api::RoyaltyReportsController < ApplicationController

  include ActionView::Helpers::NumberHelper

  def index
    @reports = RoyaltyReport.includes(film: [:licensor]).where(quarter: params[:quarter], year: params[:year])
    @errors = flash[:errors] || []
    render "index.json.jbuilder"
  end

  def show
    query_data_for_show_jbuilder
    render "show.json.jbuilder"
  end

  def update
    error_present = false
    errors = {
      report: [],
      streams: {}
    }
    begin
      ActiveRecord::Base.transaction do
        @report = RoyaltyReport.find(params[:id])
        unless @report.update(report_params)
          error_present = true
          errors[:report] = @report.errors.full_messages
        end
        RoyaltyRevenueStream.where(royalty_report_id: params[:id]).each do |royalty_revenue_stream|
          unless royalty_revenue_stream.update(revenue_stream_params(royalty_revenue_stream.id))
            error_present = true
            errors[:streams][royalty_revenue_stream.id] = royalty_revenue_stream.errors.full_messages
          end
        end
        fail if error_present
        query_data_for_show_jbuilder
        render "show.json.jbuilder"
      end
    rescue
      render json: errors, status: 422
    end
  end

  def send_all
    time_started = Time.now.to_s
    total_reports = RoyaltyReport.joins(:film).where(films: {days_statement_due: params[:days_due], export_reports: true, send_reports: true}, quarter: params[:quarter], year: params[:year], date_sent: nil)
    job = Job.create!(job_id: time_started, first_line: "Exporting Reports", second_line: true, current_value: 0, total_value: total_reports.length)
    ExportAndSendReports.perform_async(params[:days_due], params[:quarter], params[:year], time_started)
    render json: job
  end

  def export
    pathname = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p("#{pathname}")
    query_data_for_show_jbuilder
    report = @reports[0]
    report.export!(pathname)
    File.open("#{pathname}/#{report_name(@film, @reports[0])}", 'r') do |f|
      send_data f.read, filename: report_name(@film, @reports[0])
    end
  end

  def export_all
    time_started = Time.now.to_s
    ExportAllReports.perform_async(params[:days_due], params[:quarter], params[:year], time_started)
    render text: time_started, status: 200
  end

  def zip
    zip_data = File.read(Rails.root.join('tmp', params[:time], 'statements.zip'))
    send_data(zip_data, :type => 'application/zip', :filename => 'statements.zip')
  end

  # def status
  #   s3 = Aws::S3::Resource.new(
  #     credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
  #     region: 'us-east-1'
  #   )
  #
  #   resp = Aws::S3::Client.new.list_objects(bucket: ENV['S3_BUCKET'])
  #   reports = resp.contents.select do |object|
  #     object.key.split("/")[0] == params[:time]
  #   end
  #
  #   if reports.map { |object| object.key }.include?("#{params[:time]}/statements.zip")
  #     render text: 'done', status: 200
  #   else
  #     render text: reports.length, status: 200
  #   end
  # end

  def upload
    uploaded_io = params[:user][:file]
    File.open(Rails.root.join('sage', uploaded_io.original_filename), 'wb') do |file|
      file.write(uploaded_io.read)
    end

    # create reports for every film, if they don't already exist
    reports = RoyaltyReport.where(year: params[:year], quarter: params[:quarter])
    if reports.length == 0
      Film.where(short_film: false).each do |film|
        prev_report, prev_streams = get_prev_report(film, params[:quarter].to_i, params[:year].to_i)
        report = RoyaltyReport.new(film_id: film.id, deal_id: film.deal_type_id, quarter: params[:quarter], year: params[:year], mg: film.mg, e_and_o: film.e_and_o)
        prev_amount_due = (prev_report.joined_amount_due < 0 ? 0 : prev_report.joined_amount_due)
        report.amount_paid = (prev_report.amount_paid + prev_amount_due) if prev_report
        if film.deal_type_id == 4
          report.cume_total_expenses = prev_report.joined_total_expenses if prev_report
        end
        report.save!

        FilmRevenuePercentage.where(film_id: film.id).joins(:revenue_stream).order('revenue_streams.order').each_with_index do |film_revenue_percentage, index|
          RoyaltyRevenueStream.create(royalty_report_id: report.id, revenue_stream_id: film_revenue_percentage.revenue_stream_id, licensor_percentage: film_revenue_percentage.value, cume_revenue: prev_streams[index].joined_revenue, cume_expense: prev_streams[index].joined_expense)
        end
      end
    else
      if params[:label] == "revenue"
        ActiveRecord::Base.connection.execute("UPDATE royalty_revenue_streams SET current_revenue = 0 FROM royalty_reports WHERE royalty_reports.id = royalty_revenue_streams.royalty_report_id AND royalty_reports.year = #{params[:year]} AND royalty_reports.quarter = #{params[:quarter]}")
      elsif params[:label] == "expenses"
        ActiveRecord::Base.connection.execute("UPDATE royalty_revenue_streams SET current_expense = 0 FROM royalty_reports WHERE royalty_reports.id = royalty_revenue_streams.royalty_report_id AND royalty_reports.year = #{params[:year]} AND royalty_reports.quarter = #{params[:quarter]}")
        ActiveRecord::Base.connection.execute("UPDATE royalty_reports SET current_total_expenses = 0 WHERE royalty_reports.year = #{params[:year]} AND royalty_reports.quarter = #{params[:quarter]}")
      end
    end

    require 'roo'
    xlsx = Roo::Spreadsheet.open(Rails.root.join('sage', uploaded_io.original_filename).to_s)
    sheet = xlsx.sheet(0)
    index = 2
    errors = []
    while index <= xlsx.last_row
      columns = sheet.row(index)
      found_film = false
      films = Film.where("short_film = FALSE AND LOWER(films.sage_id) = LOWER('#{columns[0].gsub("'", "''")}')")
      if films.length > 0
        found_film = true
      else
        films = Film.where("short_film = FALSE AND LOWER(films.title) = LOWER('#{columns[0].gsub("'", "''")}')")
        if films.length > 0
          found_film = true
        elsif ["BEYOND BORDERS", "FACES OF ISRAEL", "THE FEMALE GAZE", "FRENCH LANGUAGE GIFT BOX", "LATIN AMERICAN GIFT BOX", "SPANISH LANGUAGE GIFT BOX"].include?(columns[0].strip)
          errors << "not video revenue (#{columns[3]}) (#{index})" unless columns[1] == "30200"
          found_box_set = true
        else
          errors << "Sage ID #{columns[0]} not found."
        end
      end

      if found_box_set
        case columns[0].strip
        when "BEYOND BORDERS"
          amount = (columns[3].to_d / 3).truncate(2)
          films = Film.where(title: ['A Bottle in the Gaza Sea', 'Arranged', 'Foreign Letters'])
          films.each do |film|
            report = RoyaltyReport.find_by(film_id: film.id, quarter: params[:quarter], year: params[:year])
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
            stream.current_revenue += amount
            stream.save!
          end
        when "FACES OF ISRAEL"
          amount = (columns[3].to_d / 4).truncate(2)
          films = Film.where(title: ['Campfire', 'For My Father', 'The Human Resources Manager', 'Seven Minutes in Heaven'])
          films.each do |film|
            report = RoyaltyReport.find_by(film_id: film.id, quarter: params[:quarter], year: params[:year])
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
            stream.current_revenue += amount
            stream.save!
          end
        when "THE FEMALE GAZE"
          amount = (columns[3].to_d / 7).truncate(2)
          films = Film.where(title: ['Arcadia', 'Madeinusa', 'Watchtower', 'Foreign Letters', 'Queen of Hearts', 'Inch\' Allah Dimanche', 'The Forest for the Trees'])
          films.each do |film|
            report = RoyaltyReport.find_by(film_id: film.id, quarter: params[:quarter], year: params[:year])
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
            stream.current_revenue += amount
            stream.save!
          end
        when "FRENCH LANGUAGE GIFT BOX"
          amount = (columns[3].to_d / 12).truncate(2)
          films = Film.where(title: ['Inch\' Allah Dimanche', 'Raja', 'Viva Laldjerie', 'Le Grand Voyage', 'Aaltra', 'Familia', 'Dreams of Dust', 'Her Name is Sabine', 'The Grocer\'s Son', 'Eldorado', 'Welcome', '1981'])
          films.each do |film|
            report = RoyaltyReport.find_by(film_id: film.id, quarter: params[:quarter], year: params[:year])
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
            stream.current_revenue += amount
            stream.save!
          end
        when "LATIN AMERICAN GIFT BOX"
          amount = (columns[3].to_d / 12).truncate(2)
          films = Film.where(title: ['Clandestine Childhood', 'Madeinusa', 'The Violin', 'Viva Cuba', 'XXY', 'The Pope\'s Toilet', 'Lake Tahoe', 'The Window', 'Gigante', 'The Wind Journeys', 'Alamar', 'Only When I Dance'])
          films.each do |film|
            report = RoyaltyReport.find_by(film_id: film.id, quarter: params[:quarter], year: params[:year])
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
            stream.current_revenue += amount
            stream.save!
          end
        when "SPANISH LANGUAGE GIFT BOX"
          amount = (columns[3].to_d / 12).truncate(2)
          films = Film.where(title: ['Clandestine Childhood', 'Madeinusa', 'The Violin', 'Viva Cuba', 'XXY', 'The Pope\'s Toilet', 'Lake Tahoe', 'The Window', 'Gigante', 'The Wind Journeys', 'Alamar', 'Only When I Dance'])
          films.each do |film|
            report = RoyaltyReport.find_by(film_id: film.id, quarter: params[:quarter], year: params[:year])
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
            stream.current_revenue += amount
            stream.save!
          end
        end
      end

      if found_film
        film = films[0]
        report = RoyaltyReport.find_by(film_id: film.id, quarter: params[:quarter], year: params[:year])
        gl = columns[1]

        if params[:label] == "revenue"
          case gl
          when "30100"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 1)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30200"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30300"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 13)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30410"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 2)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30430"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 2)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30440"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 2)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30400"
            if FilmRight.find_by(film_id: film.id, right_id: 2).value == true
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 2)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, params[:label])
            else
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
              stream.current_revenue += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, params[:label])
            end
          when "30415"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 4)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30420"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 4)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30500"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 6)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30510"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 8)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30520"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30600"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 12)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30700"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 7)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30800"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 11)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when "30900"
            stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 11)
            stream.current_revenue += columns[3]
            stream.save!
            check_for_empty_percentage(stream, errors, film.title, params[:label])
          when nil
            errors << "GL Code is empty on line #{index}"
          else
            errors << "GL Code #{columns[1]} not found."
          end
        elsif params[:label] == "expenses"
          if film.deal_type_id == 2 || film.deal_type_id == 3 || film.deal_type_id == 5 || film.deal_type_id == 6
            if (FilmRight.find_by(film_id: film.id, right_id: 13).value || FilmRight.find_by(film_id: film.id, right_id: 14).value || FilmRight.find_by(film_id: film.id, right_id: 15).value) && !FilmRight.find_by(film_id: film.id, right_id: 1).value && !FilmRight.find_by(film_id: film.id, right_id: 2).value && !FilmRight.find_by(film_id: film.id, right_id: 12).value && !FilmRight.find_by(film_id: film.id, right_id: 5).value && !FilmRight.find_by(film_id: film.id, right_id: 6).value && !FilmRight.find_by(film_id: film.id, right_id: 10).value && !FilmRight.find_by(film_id: film.id, right_id: 11).value && !FilmRight.find_by(film_id: film.id, right_id: 8).value && !FilmRight.find_by(film_id: film.id, right_id: 9).value
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 11)
              stream.current_expense += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, params[:label])
            elsif gl == "50400"
              unless film.deal_type_id == 3
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 11)
                stream.current_expense += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, params[:label])
              end
            elsif gl == "50200"
              unless film.deal_type_id == 3
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 13)
                stream.current_expense += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, params[:label])
              end
            elsif gl == "40070" || gl == "50300"
              unless film.deal_type_id == 3
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 2)
                stream.current_expense += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, params[:label])
              end
            elsif gl == "50360" || gl == "48200"
              unless film.deal_type_id == 3
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
                stream.current_expense += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, params[:label])
              end
            elsif gl == "50110" || gl == "40041" || gl == "40064" || gl == "40063" || gl == "40051" || gl == "50111" || gl == "40042" || gl == "50112" || gl == "40061"
              unless film.deal_type_id == 3
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
                stream.current_expense += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, params[:label])
              end
            elsif gl == "40092" || gl == "50105" || gl == "50101" || gl == "40086" || gl == "50102" || gl == "50103" || gl == "40078" || gl == "40080"
              stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 1)
              stream.current_expense += columns[3]
              stream.save!
              check_for_empty_percentage(stream, errors, film.title, params[:label])
            elsif gl == "47000"
              unless film.deal_type_id == 3
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 12)
                stream.current_expense += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, params[:label])
              end
            elsif gl == "61110" || gl == "63104" || gl == "64101" || gl == "63114" || gl == "61140" || gl == "63103" || gl == "61120" || gl == "64100" || gl == "64103" || gl == "69111" || gl == "69113" || gl == "60200" || gl == "60400" || gl == "60300" || gl == "63110" || gl == "63120" || gl == "69109" || gl == "63105" || gl == "61100" || gl == "61160" || gl == "63111" || gl == "63106" || gl == "63118" || gl == "63107" || gl == "63112" || gl == "67160" || gl == "63119" || gl == "65101" || gl == "69110" || gl == "60100" || gl == "40071" || gl == "64104" || gl == "61150" || gl == "63116" || gl == "69100" || gl == "69112" || gl == "69101" || gl == "69102"
              if FilmRight.find_by(film_id: film.id, right_id: 1).value
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 1)
                stream.current_expense += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, params[:label])
              else
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 7)
                stream.current_expense += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, params[:label])
              end
            elsif gl == "50500" || gl == "40021"
              unless film.deal_type_id == 3
                if FilmRight.find_by(film_id: film.id, right_id: 6).value
                  stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 7)
                  stream.current_expense += columns[3]
                  stream.save!
                  check_for_empty_percentage(stream, errors, film.title, params[:label])
                else
                  stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
                  stream.current_expense += columns[3]
                  stream.save!
                  check_for_empty_percentage(stream, errors, film.title, params[:label])
                end
              end
            elsif gl == "40031"
              unless film.deal_type_id == 3
                if FilmRight.find_by(film_id: film.id, right_id: 12).value
                  stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
                  stream.current_expense += columns[3]
                  stream.save!
                  check_for_empty_percentage(stream, errors, film.title, params[:label])
                else
                  stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 7)
                  stream.current_expense += columns[3]
                  stream.save!
                  check_for_empty_percentage(stream, errors, film.title, params[:label])
                end
              end
            elsif gl == "40040"
              if FilmRight.find_by(film_id: film.id, right_id: 1).value
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 1)
                stream.current_expense += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, params[:label])
              elsif FilmRight.find_by(film_id: film.id, right_id: 7).value
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
                stream.current_expense += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, params[:label])
              else
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 3)
                stream.current_expense += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, params[:label])
              end
            elsif gl == "40011" || gl == "48000" || gl == "50350"
              unless film.deal_type_id == 3
                if FilmRight.find_by(film_id: film.id, right_id: 6).value
                  stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 7)
                  stream.current_expense += columns[3]
                  stream.save!
                  check_for_empty_percentage(stream, errors, film.title, params[:label])
                else
                  stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
                  stream.current_expense += columns[3]
                  stream.save!
                  check_for_empty_percentage(stream, errors, film.title, params[:label])
                end
              end
            elsif gl == "48100"
              unless film.deal_type_id == 3
                if FilmRight.find_by(film_id: film.id, right_id: 7).value
                  stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 10)
                  stream.current_expense += columns[3]
                  stream.save!
                  check_for_empty_percentage(stream, errors, film.title, params[:label])
                else
                  stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 7)
                  stream.current_expense += columns[3]
                  stream.save!
                  check_for_empty_percentage(stream, errors, film.title, params[:label])
                end
              end
            elsif gl == "40090"
              unless film.deal_type_id == 3
                stream = RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: 2)
                stream.current_expense += columns[3]
                stream.save!
                check_for_empty_percentage(stream, errors, film.title, params[:label])
              end
            elsif gl == nil
              errors << "GL Code is empty on line #{index}"
            else
              errors << "GL Code #{columns[1]} not found."
            end
          elsif film.deal_type_id == 4
            report.current_total_expenses += columns[3]
            report.save!
          end
        end
      end

      index += 1
    end

    if params[:label] == "expenses"
      RoyaltyReport.includes(:film, :royalty_revenue_streams).where(year: params[:year], quarter: params[:quarter]).each do |report|
        calculate(report.film, report, report.royalty_revenue_streams)
        if report.film.expense_cap > 0 && report.joined_total_expenses > report.film.expense_cap
          errors << "#{report.film.title} is over expense cap."
        end
      end
    end

    flash[:errors] = errors
    redirect_to '/royalty_reports'
  end

  private

  def report_name(film, report)
    "#{film.title} - Q#{report.quarter} #{report.year}.pdf"
  end

  def check_for_empty_percentage(stream, errors, title, label)
    if stream.licensor_percentage == 0
      rev_stream = RevenueStream.find(stream.revenue_stream_id)
      stream_name = rev_stream.nickname || rev_stream.name
      message = "#{label.capitalize} #{label == 'revenue' ? 'was' : 'were'} added to #{stream_name} for \"#{title}\", but percentage is zero."
      errors << message unless errors.include?(message)
    end
  end

  def query_data_for_show_jbuilder
    @reports = RoyaltyReport.where(id: params[:id])
    @film = Film.find(@reports[0].film_id)
    @streams = RoyaltyRevenueStream.where(royalty_report_id: @reports[0].id).joins(:revenue_stream).order('revenue_streams.order')
    calculate(@film, @reports[0], @streams)
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
    calculate(@film, @reports[0], @streams)
    return [@reports[0], @streams]
  end

  def dollarify(input)
    input = number_with_precision(input, precision: 2, delimiter: ',').to_s
    if (input[0] == "-")
      '($' + input[1..-1] + ')'
    else
      '$' + input
    end
  end

  def negafy(input)
    string = number_with_precision(input, precision: 2, delimiter: ',').to_s
    if (input > 0)
      '($' + string + ')'
    else
      '$' + string
    end
  end

  def expense_class(report)
    report.film.deal_type_id != 1 && report.film.deal_type_id != 4
  end

  def gr_deal(report)
    report.film.deal_type_id == 5 || report.film.deal_type_id == 6
  end

  def calculate(film, report, streams)
    report.current_total_revenue = 0.00
    report.current_total_expenses = 0.00 unless film.deal_type_id == 4
    report.current_total = 0.00
    streams.each do |stream|
      stream.joined_revenue = stream.current_revenue + stream.cume_revenue
      stream.joined_expense = stream.current_expense + stream.cume_expense
      if film.deal_type_id == 1 # No Expenses Recouped
        stream.current_licensor_share = (stream.current_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_licensor_share = (stream.cume_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_licensor_share = (stream.joined_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 2 # Expenses Recouped From Top
        stream.current_difference = stream.current_revenue - stream.current_expense
        stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_difference = stream.cume_revenue - stream.cume_expense
        stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_difference = stream.joined_revenue - stream.joined_expense
        stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 3 # Theatrical Expenses Recouped From Top
        if ["Theatrical", "Non-Theatrical", "Commercial Video"].include?(stream.revenue_stream.name)
          stream.current_difference = stream.current_revenue - stream.current_expense
          stream.cume_difference = stream.cume_revenue - stream.cume_expense
          stream.joined_difference = stream.joined_revenue - stream.joined_expense
        else
          stream.current_difference = stream.current_revenue
          stream.cume_difference = stream.cume_revenue
          stream.joined_difference = stream.joined_revenue
        end
        stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 4 # Expenses Recouped From Licensor Share
        stream.current_licensor_share = (stream.current_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_licensor_share = (stream.cume_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_licensor_share = (stream.joined_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 5 # GR Percentage
        stream.current_gr = (stream.current_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
        stream.current_difference = stream.current_revenue - stream.current_gr - stream.current_expense
        stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_gr = (stream.cume_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
        stream.cume_difference = stream.cume_revenue - stream.cume_gr - stream.cume_expense
        stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_gr = (stream.joined_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
        stream.joined_difference = stream.joined_revenue - stream.joined_gr - stream.joined_expense
        stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 6 # GR Percentage Theatrical/Non-Theatrical
        if ["Theatrical", "Non-Theatrical"].include?(stream.revenue_stream.name)
          stream.current_gr = (stream.current_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
          stream.current_difference = stream.current_revenue - stream.current_gr - stream.current_expense
          stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          stream.cume_gr = (stream.cume_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
          stream.cume_difference = stream.cume_revenue - stream.cume_gr - stream.cume_expense
          stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          stream.joined_gr = (stream.joined_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
          stream.joined_difference = stream.joined_revenue - stream.joined_gr - stream.joined_expense
          stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        else
          stream.current_difference = stream.current_revenue - stream.current_expense
          stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          stream.cume_difference = stream.cume_revenue - stream.cume_expense
          stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          stream.joined_difference = stream.joined_revenue - stream.joined_expense
          stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        end
      end

      report.current_total_revenue += stream.current_revenue
      report.current_total_expenses += stream.current_expense unless film.deal_type_id == 4
      report.current_total += stream.current_licensor_share

      report.cume_total_revenue += stream.cume_revenue
      report.cume_total_expenses += stream.cume_expense unless film.deal_type_id == 4
      report.cume_total += stream.cume_licensor_share
      report.joined_total_revenue += stream.joined_revenue
      report.joined_total_expenses += stream.joined_expense unless film.deal_type_id == 4
      report.joined_total += stream.joined_licensor_share
      if film.deal_type_id == 4
        report.amount_due = report.cume_total - report.cume_total_expenses - report.e_and_o - report.mg - report.amount_paid
        report.joined_amount_due = report.joined_total - report.current_total_expenses - report.cume_total_expenses - report.e_and_o - report.mg - report.amount_paid
      else
        report.joined_amount_due = report.joined_total - report.e_and_o - report.mg - report.amount_paid
        report.amount_due = report.cume_total - report.e_and_o - report.mg - report.amount_paid
      end
    end
    if film.deal_type_id == 4
      report.current_share_minus_expenses = report.current_total - report.current_total_expenses
      report.joined_total_expenses = report.current_total_expenses + report.cume_total_expenses
    end
  end

  def report_params
    params[:report].permit(:current_total_expenses, :cume_total_expenses, :mg, :e_and_o, :amount_paid)
  end

  def revenue_stream_params(id)
    params[:streams][id.to_s].permit(:current_revenue, :current_expense, :cume_revenue, :cume_expense, :licensor_percentage)
  end

  def export_report(report, streams, film)
    string = "<style>"
    string += "body {"
    string +=   "font-family: Arial;"
    string +=   "font-size: 12px;"
    string +=   "line-height: 16px;"
    string += "}"
    string += "table {"
    string +=   "width: 100%;"
    string +=   "font-family: Arial;"
    string +=   "font-size: 12px;"
    string +=   "line-height: 14px;"
    string +=   "text-align: left;"
    string += "}"
    string += ".upper-right {"
    string +=   "float: right;"
    string += "}"
    string += ".producer-report {"
    string +=   "padding-top: 5px;"
    string +=   "font-family: Times;"
    string +=   "letter-spacing: .5px;"
    string +=   "font-size: 30px;"
    string +=   "margin-bottom: 6px;"
    string += "}"
    string += ".film-movement {"
    string +=   "font-size: 16px;"
    string +=   "margin-bottom: 4px;"
    string += "}"
    string += "tr.totals-row td {"
    string +=   "padding-top: 14px;"
    string +=   "padding-bottom: 45px;"
    string += "}"
    string += "tr.totals-row-2 td {"
    string +=   "padding-top: 14px;"
    string += "}"
    string += "tr.current-share td {"
    string +=   "padding-bottom: 45px;"
    string += "}"
    string += "th {"
    string +=   "padding-bottom: 10px;"
    string += "}"
    string += ".clearfix:after {"
    string +=   "content: \"\";"
    string +=   "display: block;"
    string +=   "clear: both;"
    string +=  "}"
    string += ".bottom-table {"
    string +=   "float: right;"
    string +=   "width: 300px;"
    string += "}"
    string += ".bottom-text {"
    string +=   "font-size: 10px;"
    string += "}"
    string += "</style>"
    string += "<div class=\"upper-right\">"
    string +=   "<div class=\"producer-report\">Producer Report</div>"
    string +=   "#{report.film.licensor ? report.film.licensor.name : ""}<br>"
    string +=   "#{report.film.title}<br>"
    string +=   "Q#{report.quarter} #{report.year}"
    string += "</div>"
    string += "<div class=\"film-movement\">Film Movement</div>"
    string += "109 West 27th Street<br>"
    string += "Suite 9B<br>"
    string += "New York, NY 10001<br>"
    string += "212.941.7744<br><br><br>"

    string += "<table><tr>"
    string +=   "<th>Current Period</th>"
    string +=   "<th>Revenue</th>"
    string +=   "<th>#{sprintf("%g", report.gr_percentage)}% Fee</th>" if gr_deal(report)
    string +=   "<th>Expenses</th>" if expense_class(report)
    string +=   "<th>Difference</th>" if expense_class(report)
    string +=   "<th>Licensor %</th>"
    string +=   "<th>Licensor Share</th></tr>"
    streams.each do |stream|
      if stream.current_revenue > 0 || stream.current_expense > 0
        string += "<tr>"
        string +=   "<td>#{stream.revenue_stream.name}</td>"
        string +=   "<td>#{dollarify(stream.current_revenue)}</td>"
        string +=   "<td>#{negafy(stream.current_gr)}</td>" if gr_deal(report)
        string +=   "<td>#{negafy(stream.current_expense)}</td>" if expense_class(report)
        string +=   "<td>#{dollarify(stream.current_difference)}</td>" if expense_class(report)
        string +=   "<td>#{sprintf("%g", stream.licensor_percentage)}%</td>"
        string +=   "<td>#{dollarify(stream.current_licensor_share)}</td>"
        string += "</tr>"
      end
    end
    string += "<tr class=\"#{report.film.deal_type_id == 4 ? "totals-row-2" : "totals-row"}\">"
    string +=   "<td>Current Total</td>"
    string +=   "<td>#{dollarify(report.current_total_revenue)}</td>"
    string +=   "<td></td>" if gr_deal(report)
    string +=   "<td>#{negafy(report.current_total_expenses)}</td>" if expense_class(report)
    string +=   "<td></td>" if expense_class(report)
    string +=   "<td></td>"
    string +=   "<td>#{dollarify(report.current_total)}</td>"
    string += "</tr>"
    if report.film.deal_type_id == 4
      string += "<tr>"
      string +=   "<td>Current Expenses</td><td></td><td></td><td>#{negafy(report.current_total_expenses)}</td>"
      string += "</tr>"
      string += "<tr class=\"current-share\">"
      string +=   "<td>Current Licensor Share</td><td></td><td></td><td>#{dollarify(report.current_share_minus_expenses)}</td>"
      string += "</tr>"
    end
    string += "<tr>"
    string +=   "<th>Cumulative</th>"
    string +=   "<th></th>"
    string +=   "<th></th>" if gr_deal(report)
    string +=   "<th></th>" if expense_class(report)
    string +=   "<th></th>" if expense_class(report)
    string +=   "<th></th>"
    string +=   "<th></th>"
    string += "</tr>"
    streams.each do |stream|
      if stream.joined_revenue > 0 || stream.joined_expense > 0
        string += "<tr>"
        string +=   "<td>#{stream.revenue_stream.name}</td>"
        string +=   "<td>#{dollarify(stream.joined_revenue)}</td>"
        string +=   "<td>#{negafy(stream.joined_gr)}</td>" if gr_deal(report)
        string +=   "<td>#{negafy(stream.joined_expense)}</td>" if expense_class(report)
        string +=   "<td>#{dollarify(stream.joined_difference)}</td>" if expense_class(report)
        string +=   "<td>#{sprintf("%g", stream.licensor_percentage)}%</td>"
        string +=   "<td>#{dollarify(stream.joined_licensor_share)}</td>"
        string += "</tr>"
      end
    end
    string += "<tr class=\"totals-row\">"
    string +=   "<td>Cumulative Total</td>"
    string +=   "<td>#{dollarify(report.joined_total_revenue)}</td>"
    string +=   "<td></td>" if gr_deal(report)
    string +=   "<td>#{negafy(report.joined_total_expenses)}</td>" if expense_class(report)
    string +=   "<td></td>" if expense_class(report)
    string +=   "<td></td>"
    string +=   "<td>#{dollarify(report.joined_total)}</td>"
    string += "</tr>"
    string += "</table>"
    string += "<div class=\"clearfix\"><div class=\"bottom-table\"><table>"
    string +=   "<tr>"
    string +=     "<td>Cumulative Licensor Share</td>"
    string +=     "<td>#{dollarify(report.joined_total)}</td>"
    string +=   "</tr>"
    if report.film.deal_type_id == 4
      string +=   "<tr>"
      string +=     "<td>Cumulative Expenses</td>"
      string +=     "<td>#{negafy(report.joined_total_expenses)}</td>"
      string +=   "</tr>"
    end
    string +=   "<tr>"
    string +=     "<td>MG</td>"
    string +=     "<td>#{negafy(report.mg)}</td>"
    string +=   "</tr>"
    string +=   "<tr>"
    string +=     "<td>Amount Paid</td>"
    string +=     "<td>#{negafy(report.amount_paid)}</td>"
    string +=   "</tr>"
    string +=   "<tr class=\"totals-row\">"
    string +=     "<td>Amount Due</td>"
    string +=     "<td>#{dollarify(report.joined_amount_due)}</td>"
    string +=   "</tr>"
    string += "</table></div></div>"
    string += "<div class=\"bottom-text\">"
    string += "If there is an amount due to Licensor on this report, please send an invoice for the amount due along with current bank wire information if located outside the U.S., and current mailing address if located inside the U.S.<br>No payments will be made without this invoice and information."
    string += "</div>"

    pdf = WickedPdf.new.pdf_from_string(string)
    subfolder = report.joined_amount_due > 0 ? 'amount due' : 'no amount due'
    save_path = Rails.root.join('statements', subfolder, report_name(film, report))
    File.open(save_path, 'wb') do |f|
      f << pdf
    end
  end

end

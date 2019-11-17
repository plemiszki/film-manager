class Api::RoyaltyReportsController < AdminController

  include ActionView::Helpers::NumberHelper

  before_action :redirect_unless_super_admin

  def index
    @reports = RoyaltyReport.includes(film: [:licensor]).where(quarter: params[:quarter], year: params[:year])
    @errors = flash[:errors] || []
    render "index.json.jbuilder"
  end

  def show
    @report = RoyaltyReport.find(params[:id])
    @streams = @report.royalty_revenue_streams
    @film = Film.find(@report.film_id)
    @films = [@film]

    # if @film.has_crossed_films?
    #   report, @streams, @films = RoyaltyReport.calculate_crossed_films_report(@film, report.year, report.quarter)
    # else
    # end
    render "show.json.jbuilder"
  end

  def update
    error_present = false
    errors = {
      reportErrors: [],
      streamErrors: {}
    }
    begin
      ActiveRecord::Base.transaction do
        @report = RoyaltyReport.find(params[:id])
        unless @report.update(report_params)
          @error_present = true
          errors[:reportErrors] = @report.errors.full_messages
        end
        RoyaltyRevenueStream.where(royalty_report_id: params[:id]).each do |royalty_revenue_stream|
          unless royalty_revenue_stream.update(revenue_stream_params(royalty_revenue_stream.id))
            @error_present = true
            errors[:streamErrors][royalty_revenue_stream.id] = royalty_revenue_stream.errors.full_messages
          end
        end
        fail if @error_present
        @report.calculate!
        @streams = @report.royalty_revenue_streams
        @film = Film.find(@report.film_id)
        @films = [@film]
        render "show.json.jbuilder"
      end
    rescue
      render json: errors, status: 422
    end
  end

  def import
    uploaded_io = params[:user][:file]
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
    job = Job.create!(job_id: time_started, first_line: "Importing Q#{params[:quarter]} #{params[:label].capitalize}", second_line: false)
    ImportSageData.perform_async(params[:year], params[:quarter], time_started, params[:label], original_filename)
    redirect_to "/royalty_reports", flash: {sage_import_id: job.id, quarter: params[:quarter], label: params[:label]}
  end

  def error_check
    time_started = Time.now.to_s
    total_reports = RoyaltyReport.where(year: params[:year], quarter: params[:quarter])
    job = Job.create!(job_id: time_started, first_line: "Checking For Errors", second_line: true, current_value: 0, total_value: total_reports.length)
    ErrorCheck.perform_async(params[:quarter], params[:year], time_started)
    render json: job
  end

  def totals
    time_started = Time.now.to_s
    if params[:days_due] == 'all'
      total_reports = RoyaltyReport.where(year: params[:year], quarter: params[:quarter])
    else
      total_reports = RoyaltyReport.where(year: params[:year], quarter: params[:quarter], films: { days_statement_due: params[:days_due] }).includes(:film)
    end
    job = Job.create!(job_id: time_started, first_line: "Calculating Totals", second_line: true, current_value: 0, total_value: total_reports.length)
    CalculateTotals.perform_async(params[:quarter], params[:year], params[:days_due], time_started)
    render json: job
  end

  def export
    pathname = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p("#{pathname}")
    query_data_for_show_jbuilder
    report = @reports[0]
    report.export!(pathname, @streams, @films)
    File.open("#{pathname}/#{report_name(@film, @reports[0])}", 'r') do |f|
      send_data f.read, filename: report_name(@film, @reports[0])
    end
  end

  def codes
    render 'codes.html.erb'
  end

  def export_all
    time_started = Time.now.to_s
    total_reports = RoyaltyReport.joins(:film).where(films: {days_statement_due: params[:days_due], export_reports: true}, quarter: params[:quarter], year: params[:year])
    job = Job.create!(job_id: time_started, name: "export all", first_line: "Exporting Reports", second_line: true, current_value: 0, total_value: total_reports.length)
    ExportAllReports.perform_async(params[:days_due], params[:quarter], params[:year], time_started)
    render json: job
  end

  def send_all
    time_started = Time.now.to_s
    total_reports = RoyaltyReport.joins(:film).where(films: {days_statement_due: params[:days_due], export_reports: true, send_reports: true}, quarter: params[:quarter], year: params[:year], date_sent: nil)
    job = Job.create!(job_id: time_started, first_line: "Exporting Reports", second_line: true, current_value: 0, total_value: total_reports.length)
    ExportAndSendReports.perform_async(params[:days_due], params[:quarter], params[:year], time_started)
    render json: job
  end

  private

  def redirect_unless_super_admin
    redirect_to "/" unless current_user.access == "super_admin"
  end

  def report_name(film, report)
    "#{film.crossed_film_titles.sort.join(' -- ')} - Q#{report.quarter} #{report.year}.pdf"
  end

  def query_data_for_show_jbuilder
    report = RoyaltyReport.find(params[:id])
    @film = Film.find(report.film_id)
    if @film.has_crossed_films?
      report, @streams, @films = RoyaltyReport.calculate_crossed_films_report(@film, report.year, report.quarter)
    else
      @streams = report.royalty_revenue_streams
      @films = [@film]
    end
    @reports = [report]
  end

  def report_params
    params[:report].permit(:current_total_expenses, :cume_total_expenses, :mg, :e_and_o, :amount_paid)
  end

  def revenue_stream_params(id)
    params[:streams][id.to_s].permit(:current_revenue, :current_expense, :cume_revenue, :cume_expense, :licensor_percentage)
  end

end

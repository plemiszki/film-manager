class Api::RoyaltyReportsController < AdminController

  include ActionView::Helpers::NumberHelper

  class UpdateError < RuntimeError; end

  before_action :redirect_unless_super_admin

  def index
    @reports = RoyaltyReport.includes(film: [:licensor]).where(quarter: params[:quarter], year: params[:year])
    @errors = flash[:errors] || []
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @report = RoyaltyReport.find(params[:id])
    @film = @report.film
    if @film.has_crossed_films?
      @report, @streams, @films = RoyaltyReport.calculate_crossed_films_report(@film, @report.year, @report.quarter)
      @films = @films.sort_by { |film| film.title }
    else
      @streams = @report.royalty_revenue_streams
      @films = [@film]
    end
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def update
    error_present = false
    errors = {
      reportErrors: [],
      streamErrors: {}
    }
    ActiveRecord::Base.transaction do
      @report = RoyaltyReport.find(params[:id])
      @streams = @report.royalty_revenue_streams
      @report.update(report_params)
      @streams.each do |royalty_revenue_stream|
        next unless params[:streams] && params[:streams][royalty_revenue_stream.id.to_s].present?
        royalty_revenue_stream.update(revenue_stream_params(royalty_revenue_stream.id))
      end
      fail UpdateError if @report.errors.present? || @streams.map(&:errors).any? { |errors| errors.present? }
      @report.calculate!
      recalculate_any_future_reports
      @film = Film.find(@report.film_id)
      @films = [@film]
      render 'show', formats: [:json], handlers: [:jbuilder]
    end
  rescue UpdateError
    report_errors = @report.errors.as_json(full_messages: true)
    stream_errors = @streams.map(&:errors).select { |errors| errors.present? }
    stream_errors_hashes = stream_errors.map { |errors| { errors.instance_variable_get(:@base).id => errors.as_json(full_messages: true) } }
    stream_errors_hash = stream_errors_hashes.reduce({}, &:merge)
    render json: {
      errors: { report: report_errors }
        .merge(stream_errors_hash)
        .deep_transform_keys { |k| k.to_s.camelize(:lower) }
    }, status: 422
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
    redirect_to "/royalty_reports", flash: { sage_import_id: job.id, quarter: params[:quarter], label: params[:label] }
  end

  def error_check
    time_started = Time.now.to_s
    total_reports = RoyaltyReport.where(year: params[:year], quarter: params[:quarter])
    job = Job.create!(job_id: time_started, first_line: 'Checking For Errors', second_line: true, current_value: 0, total_value: total_reports.length)
    ErrorCheck.perform_async(params[:quarter], params[:year], time_started)
    render json: { job: job.render_json }
  end

  def totals
    time_started = Time.now.to_s
    if params[:days_due] == 'all'
      total_reports = RoyaltyReport.where(year: params[:year], quarter: params[:quarter])
    else
      total_reports = RoyaltyReport.where(year: params[:year], quarter: params[:quarter], films: { days_statement_due: params[:days_due] }).includes(:film)
    end
    job = Job.create!(job_id: time_started, first_line: 'Calculating Totals', second_line: true, current_value: 0, total_value: total_reports.length)
    CalculateTotals.perform_async(params[:quarter], params[:year], params[:days_due], time_started)
    render json: { job: job.render_json }
  end

  def summary
    time_started = Time.now.to_s
    if params[:days_due] == 'all'
      total_reports = RoyaltyReport.where(year: params[:year], quarter: params[:quarter])
    else
      total_reports = RoyaltyReport.includes(:film).where(year: params[:year], quarter: params[:quarter], films: { days_statement_due: params[:days_due].to_i })
    end
    job = Job.create!(job_id: time_started, name: 'summary', first_line: 'Creating Summary', second_line: true, current_value: 0, total_value: total_reports.length)
    CreateReportsSummary.perform_async(params[:quarter], params[:year], params[:days_due], time_started)
    render json: { job: job.render_json }
  end

  def export
    pathname = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p("#{pathname}")
    report = RoyaltyReport.find(params[:id])
    film = report.film
    if film.has_crossed_films?
      report, streams, films = RoyaltyReport.calculate_crossed_films_report(film, report.year, report.quarter)
    else
      streams = report.royalty_revenue_streams
    end
    report_name = report.export(directory: pathname, royalty_revenue_streams: streams, multiple_films: (films || nil))
    File.open("#{pathname}/#{report_name}", 'r') do |f|
      send_data f.read, filename: report_name
    end
  end

  def export_uncrossed
    time_started = Time.now.to_s
    reports = RoyaltyReport.where(quarter: params[:quarter], year: params[:year], film_id: params[:film_ids])
    @job = Job.create!(job_id: time_started, name: "export uncrossed", first_line: "Exporting Reports", second_line: true, current_value: 0, total_value: reports.length)
    ExportUncrossedReports.perform_async(reports.map(&:id), time_started)
    render json: { job: @job.render_json }
  end

  def codes
    render 'codes.html.erb'
  end

  def export_all
    time_started = Time.now.to_s
    total_reports = RoyaltyReport.joins(:film).where(films: { days_statement_due: params[:days_due], export_reports: true }, quarter: params[:quarter], year: params[:year])
    job = Job.create!(job_id: time_started, name: "export all", first_line: "Exporting Reports", second_line: true, current_value: 0, total_value: total_reports.length)
    ExportAllReports.perform_async(params[:days_due], params[:quarter], params[:year], time_started)
    render json: { job: job.render_json }
  end

  def send_all
    time_started = Time.now.to_s
    total_reports = RoyaltyReport.joins(:film).where(films: { days_statement_due: params[:days_due], export_reports: true, send_reports: true }, quarter: params[:quarter], year: params[:year], date_sent: nil)
    job = Job.create!(job_id: time_started, first_line: "Exporting Reports", second_line: true, current_value: 0, total_value: total_reports.length)
    ExportAndSendReports.perform_async(params[:days_due], params[:quarter], params[:year], time_started)
    render json: { job: job.render_json }
  end

  private

  def redirect_unless_super_admin
    redirect_to "/" unless current_user.access == "super_admin"
  end

  def recalculate_any_future_reports
    prev_report = @report
    next_report = @report.next_report
    until next_report.nil?
      prev_report_streams = prev_report.royalty_revenue_streams
      next_report.royalty_revenue_streams.each_with_index do |stream, index|
        new_revenue = prev_report_streams[index].current_revenue + prev_report_streams[index].cume_revenue
        new_expense = prev_report_streams[index].current_expense + prev_report_streams[index].cume_expense
        stream.update!(cume_revenue: new_revenue, cume_expense: new_expense)
      end
      next_report.update!({ cume_total_expenses: prev_report.joined_total_expenses })
      next_report.calculate!
      prev_report = next_report
      next_report = next_report.next_report
    end
  end

  def report_params
    params[:report].permit(:current_total_expenses, :cume_total_expenses, :mg, :e_and_o, :amount_paid)
  end

  def revenue_stream_params(id)
    params[:streams][id.to_s].permit(:current_revenue, :current_expense, :cume_revenue, :cume_expense, :licensor_percentage)
  end

end

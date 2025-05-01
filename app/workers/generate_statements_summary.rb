class GenerateStatementsSummary
  include Sidekiq::Worker
  include ExportSpreadsheetHelpers
  sidekiq_options retry: false

  def perform(_, args = {})
    job = Job.find_by_job_id(args['time_started'])
    job_folder = "#{Rails.root}/tmp/#{args['time_started']}"
    FileUtils.mkdir_p("#{job_folder}")
    file_path = "#{job_folder}/statements_summary.xlsx"

    licensor = Licensor.find(args['licensor_id'])
    show_percentage_column = licensor.licensor_share_constant_across_all_revenue_streams?

    columns = {
      title: {
        label: 'Title',
      },
      period: {
        label: 'Royalty Period',
      },
      current_gross: {
        label: 'Gross Receipts (Period)',
      },
      cume_gross: {
        label: 'Gross Receipts (Cumulative)'
      },
      royalty_percentage: {
        label: 'Royalty Percentage',
        hide: !show_percentage_column,
      },
      current_net: {
        label: 'Net Receipts (Period)',
      },
      cume_net: {
        label: 'Net Receipts (Cumulative)',
      },
      expenses: {
        label: 'Expenses',
      },
      mg: {
        label: 'MG'
      },
      amount_paid: {
        label: 'Amount Paid',
      },
      amount_due: {
        label: 'Amount Due',
      },
    }

    visible_column_keys = columns.reduce([]) do |result, (key, value)|
      result << key unless value[:hide]
      result
    end

    statements = licensor.most_recent_statements

    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(:name => "Summary") do |sheet|
        add_row(sheet, visible_column_keys.map { |key| columns[key][:label]})
        statements.each do |statement|
          statement.calculate!
          film = statement.film
          mg = film.mg
          columns[:title][:value] = film.title
          columns[:period][:value] = "Q#{statement.quarter} #{statement.year}"
          columns[:current_gross][:value] = { value: statement.current_total_revenue, type: :float }
          columns[:cume_gross][:value] = { value: statement.joined_total_revenue, type: :float }
          columns[:royalty_percentage][:value] = film.film_revenue_percentages.reject { |film_revenue_percentage| film_revenue_percentage.value.zero? }.first.value
          columns[:current_net][:value] = { value: statement.current_total, type: :float }
          columns[:cume_net][:value] = { value: statement.joined_total, type: :float }
          columns[:expenses][:value] = { value: statement.joined_total_expenses, type: :float }
          columns[:mg][:value] = { value: mg, type: :float }
          columns[:amount_paid][:value] = { value: statement.amount_paid, type: :float }
          columns[:amount_due][:value] = { value: statement.joined_amount_due, type: :float }

          add_row(sheet, visible_column_keys.map { |key| columns[key][:value] })
        end
        p.serialize(file_path)
      end
    end

    job.update({ first_line: "Uploading to AWS" })
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{args['time_started']}/statements_summary.xlsx")
    obj.upload_file(file_path, acl:'public-read')

    job.update!({ status: 'success', first_line: '', metadata: { url: obj.public_url }, errors_text: '' })
  end

end

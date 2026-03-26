class GenerateStatementsSummary
  include Sidekiq::Worker

  sidekiq_options retry: false

  def perform(_, args = {})
    job = Job.find_by_job_id(args['time_started'])

    licensor = Licensor.find(args['licensor_id'])
    show_percentage_column = licensor.licensor_share_constant_across_all_revenue_streams?

    columns = {
      title:               { label: 'Title' },
      period:              { label: 'Royalty Period' },
      current_gross:       { label: 'Gross Receipts (Period)' },
      cume_gross:          { label: 'Gross Receipts (Cumulative)' },
      royalty_percentage:  { label: 'Royalty Percentage', hide: !show_percentage_column },
      current_net:         { label: 'Net Receipts (Period)' },
      cume_net:            { label: 'Net Receipts (Cumulative)' },
      expenses:            { label: 'Expenses' },
      mg:                  { label: 'MG' },
      amount_paid:         { label: 'Amount Paid' },
      amount_due:          { label: 'Amount Due' }
    }

    visible_column_keys = columns.keys.reject { |key| columns[key][:hide] }
    headers = visible_column_keys.map { |key| columns[key][:label] }

    rows = licensor.most_recent_statements.map do |statement|
      statement.calculate!
      film = statement.film

      columns[:title][:value]              = film.title
      columns[:period][:value]             = "Q#{statement.quarter} #{statement.year}"
      columns[:current_gross][:value]      = { value: statement.current_total_revenue, type: :float }
      columns[:cume_gross][:value]         = { value: statement.joined_total_revenue, type: :float }
      columns[:royalty_percentage][:value] = film.film_revenue_percentages.reject { |frp| frp.value.zero? }.first&.value || 0
      columns[:current_net][:value]        = { value: statement.current_total, type: :float }
      columns[:cume_net][:value]           = { value: statement.joined_total, type: :float }
      columns[:expenses][:value]           = { value: statement.joined_total_expenses, type: :float }
      columns[:mg][:value]                 = { value: film.mg, type: :float }
      columns[:amount_paid][:value]        = { value: statement.amount_paid, type: :float }
      columns[:amount_due][:value]         = { value: statement.joined_amount_due, type: :float }

      visible_column_keys.map { |key| columns[key][:value] }
    end

    public_url = ExportAndUploadSpreadsheet.new(
      headers:  headers,
      rows:     rows,
      job:      job,
      filename: 'statements_summary.xlsx'
    ).call

    job.update!(status: 'success', first_line: '', metadata: { url: public_url }, errors_text: '')
  end
end

class GenerateStatementsSummary
  include Sidekiq::Worker
  include ExportSpreadsheetHelpers
  sidekiq_options retry: false

  HEADERS = [
    "Title",
    "Gross Receipts",
    "Net Receipts",
  ]

  def perform(_, args = {})
    job = Job.find_by_job_id(args['time_started'])
    job_folder = "#{Rails.root}/tmp/#{args['time_started']}"
    FileUtils.mkdir_p("#{job_folder}")
    file_path = "#{job_folder}/statements_summary.xlsx"

    licensor = Licensor.find(args['licensor_id'])
    statements = licensor.most_recent_statements

    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(:name => "Summary") do |sheet|
        add_row(sheet, HEADERS)
        statements.each do |statement|
          statement.calculate!
          add_row(sheet, [
            statement.film.title,
            statement.joined_total_revenue,
            statement.joined_total,
          ])
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

class ExportAndUploadSpreadsheet
  include ExportSpreadsheetHelpers
  include AwsUpload

  def initialize(headers:, rows:, job:, filename:)
    @headers  = headers
    @rows     = rows
    @job      = job
    @filename = filename
  end

  def call
    job_folder = "#{Rails.root}/tmp/#{@job.job_id}"
    file_path  = "#{job_folder}/#{@filename}"
    FileUtils.mkdir_p(job_folder)

    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(name: 'Sheet1') do |sheet|
        add_row(sheet, @headers)
        @rows.each_with_index do |row, index|
          add_row(sheet, row)
          @job.update(current_value: index + 1)
        end
        p.serialize(file_path)
      end
    end

    @job.update(first_line: 'Uploading to AWS')
    upload_to_aws(file_path: file_path, key: "#{@job.job_id}/#{@filename}")
  end
end

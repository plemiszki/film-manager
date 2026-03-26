class ExportAndUploadSpreadsheet
  include ExportSpreadsheetHelpers
  include AwsUpload

  def initialize(headers:, rows:, job:, filename:, increment_job_column: nil)
    @headers              = headers
    @rows                 = rows
    @job                  = job
    @filename             = filename
    @increment_job_column = increment_job_column
  end

  def call
    job_folder = "#{Rails.root}/tmp/#{@job.job_id}"
    file_path  = "#{job_folder}/#{@filename}"
    FileUtils.mkdir_p(job_folder)

    col_index      = @headers.index(@increment_job_column) if @increment_job_column
    last_col_value = nil
    job_counter    = 0

    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(name: 'Sheet1') do |sheet|
        add_row(sheet, @headers)
        @rows.each_with_index do |row, index|
          add_row(sheet, row)
          if col_index
            col_value = row[col_index]
            if col_value != last_col_value
              last_col_value = col_value
              job_counter += 1
              @job.update(current_value: job_counter)
            end
          else
            @job.update(current_value: index + 1)
          end
        end
        p.serialize(file_path)
      end
    end

    @job.update(first_line: 'Uploading to AWS')
    upload_to_aws(file_path: file_path, key: "#{@job.job_id}/#{@filename}")
  end
end

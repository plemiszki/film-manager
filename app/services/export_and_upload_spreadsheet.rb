require 'csv'

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

    @col_index      = @headers.index(@increment_job_column) if @increment_job_column
    @last_col_value = nil
    @job_counter    = 0

    if @filename.end_with?('.csv')
      write_csv(file_path)
    else
      write_xlsx(file_path)
    end

    @job.update(first_line: 'Uploading to AWS')
    upload_to_aws(file_path: file_path, key: "#{@job.job_id}/#{@filename}")
  end

  private

  def write_xlsx(file_path)
    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(name: 'Sheet1') do |sheet|
        add_row(sheet, @headers)
        @rows.each_with_index do |row, index|
          add_row(sheet, row)
          update_job_progress(row, index)
        end
        p.serialize(file_path)
      end
    end
  end

  def write_csv(file_path)
    CSV.open(file_path, 'wb', col_sep: ',', row_sep: "\r\n") do |csv|
      csv << @headers
      @rows.each_with_index do |row, index|
        csv << row.map { |datum| datum.is_a?(Hash) ? datum[:value] : datum }
        update_job_progress(row, index)
      end
    end
  end

  def update_job_progress(row, index)
    if @col_index
      col_value = row[@col_index]
      if col_value != @last_col_value
        @last_col_value = col_value
        @job_counter += 1
        @job.update(current_value: @job_counter)
      end
    else
      @job.update(current_value: index + 1)
    end
  end
end

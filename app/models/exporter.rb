class Exporter < ActiveRecord::Base

  def self.export_spreadsheet(path:, data:, sheet_name:)
    require 'xlsx_writer'
    doc = XlsxWriter.new
    sheet = doc.add_sheet(sheet_name || "Data")
    data.each do |row|
      sheet.add_row(row)
    end
    FileUtils.mv doc.path, "#{Rails.root}/#{path}"
    doc.cleanup
  end

end

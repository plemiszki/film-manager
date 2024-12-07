module ExportSpreadsheetHelpers

  extend ActiveSupport::Concern

  def add_row(sheet, data)
    values = data.map do |datum|
      datum.is_a?(Hash) ? datum[:value] : datum
    end
    types = data.map do |datum|
      datum.is_a?(Hash) ? datum[:type] : :string
    end
    sheet.add_row(values, types: types)
  end

end

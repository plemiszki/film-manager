class RoyaltyReportsController < ApplicationController

  def show
    @royalty_report = RoyaltyReport.find_by(id: params[:id])
    render "show.html.erb"
  end

  def export
    doc = 'test.txt'
    File.open(doc, 'w')
    File.open(doc, 'r') do |f|
      send_data f.read, type: 'text; charset=utf-8', filename: "test.txt"
    end
    File.delete(doc)
  end

end

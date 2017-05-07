class ExportAllReports
  include Sidekiq::Worker

  def perform(days_due, quarter, year)
    File.delete(Rails.root.join('statements', 'statements.zip')) if File.exist?(Rails.root.join('statements', 'statements.zip'))
    Pathname.new(Rails.root.join('statements', 'amount due')).children.each { |file| file.unlink unless file.basename.to_s == '.gitignore' }
    Pathname.new(Rails.root.join('statements', 'no amount due')).children.each { |file| file.unlink unless file.basename.to_s == '.gitignore' }

    reports = RoyaltyReport.includes(film: [:licensor], royalty_revenue_streams: [:revenue_stream]).where(quarter: quarter, year: year)
    reports.each do |report|
      if (days_due == "all" || report.film.days_statement_due == days_due.to_i) && report.film.export_reports
        p '---------------------------'
        p report.film.title
        p '---------------------------'
        report.calculate!
        report.export!
      end
    end

    files = Dir.glob("#{Rails.root}/statements/amount due/*.pdf")
    files2 = Dir.glob("#{Rails.root}/statements/no amount due/*.pdf")

    require 'zip'
    Zip::File.open(Rails.root.join('statements', 'statements.zip'), Zip::File::CREATE) do |zip|
      files.each do |file|
        zip.add("amount due/#{file.split('/')[-1]}", file)
      end
      files2.each do |file|
        zip.add("no amount due/#{file.split('/')[-1]}", file)
      end
    end
  end
end

class ImportData
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(time_started)
    Importer.import_licensors(time_started)
    Importer.import_films(time_started)
  end
end

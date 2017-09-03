class ImportData
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(time_started)
    p '---------------------------'
    p 'STARTING DATA IMPORT'
    p '---------------------------'
    Importer.import_admin(time_started)
    Importer.import_films(time_started)
    p '---------------------------'
    p 'FINISHED DATA IMPORT'
    p '---------------------------'
  end
end

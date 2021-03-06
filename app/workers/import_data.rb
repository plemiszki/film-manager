class ImportData
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(time_started)
    p '---------------------------'
    p 'STARTING DATA IMPORT'
    p '---------------------------'
    # Importer.check_genres(time_started)
    # Importer.import_admin(time_started)
    # Importer.partial_import(time_started)
    # Importer.import_formats(time_started)
    # Importer.import_theaters(time_started)
    # Importer.import_bookings(time_started)
    Importer.get_orders(time_started)
    p '---------------------------'
    p 'FINISHED DATA IMPORT'
    p '---------------------------'
  end
end

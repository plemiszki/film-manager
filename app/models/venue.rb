class Venue < ActiveRecord::Base

  validates :label, :venue_type, presence: true
  validates :label, uniqueness: true

  has_many :bookings

  # class << self
  #
  #   def convert_virtual_venue_bookings!
  #     spreadsheet = [
  #       ["Virtual Venue", "Map To Venue Name", "Map To Venue ID"]
  #     ]
  #     virtual_venues = Venue.where("lower(label) like ?", "%virtual%").joins(:bookings)
  #     other_venues = Venue.where("lower(label) not like ?", "%virtual%")
  #     virtual_venues.each do |virtual_venue|
  #       search_term = virtual_venue.label.gsub("Virtual Screening Room", "").gsub("Virtual Cinema", "").gsub(/\d+$/, "").strip
  #       exact_match = other_venues.where("lower(label) like ?", search_term.downcase).first
  #       if exact_match
  #         spreadsheet << [virtual_venue.label, exact_match.label, exact_match.id]
  #       else
  #         possible_venues = other_venues.where("lower(label) like ?", "%#{search_term.downcase}%")
  #         if possible_venues.count == 1
  #           spreadsheet << [virtual_venue.label, possible_venues.first.label, possible_venues.first.id]
  #         else
  #           search_term = search_term.gsub("The ", "")
  #           possible_venues = other_venues.where("lower(label) like ?", "%#{search_term.downcase}%")
  #           if possible_venues.count == 1
  #             spreadsheet << [virtual_venue.label, possible_venues.first.label, possible_venues.first.id]
  #           else
  #             spreadsheet << [virtual_venue.label, '???', '???']
  #           end
  #         end
  #       end
  #     end
  #     Exporter.export_spreadsheet(path: '/virtual_venues.xlsx', data: spreadsheet, sheet_name: 'Virtual Venues')
  #   end
  #
  # end

end

task :clear_s3 => :environment do
  Job.clear_s3_objects
end

task :box_office_reminders => :environment do
  Booking.send_box_office_reminders(name: "Jimmy Weaver", email: "jimmy@filmmovement.com")
end

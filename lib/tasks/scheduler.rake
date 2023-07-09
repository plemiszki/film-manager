task :clear_s3 => :environment do
  Job.clear_s3_objects
end

task :box_office_reminders => :environment do
  Booking.send_box_office_reminders
end

task :payment_reminders => :environment do
  Booking.send_payment_reminders
end

task :expiration_reminders => :environment do
  Film.send_expiration_reminders!
  SubRight.send_expiration_reminders!
end

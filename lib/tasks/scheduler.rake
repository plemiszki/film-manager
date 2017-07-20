task :clear_s3 => :environment do
  Job.clear_s3_objects
end

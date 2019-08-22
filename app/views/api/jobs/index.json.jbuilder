json.jobs @jobs do |job|
  json.id job.id
  json.jobId job.job_id
  json.done job.done
end

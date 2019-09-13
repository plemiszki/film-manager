json.jobs @jobs do |job|
  json.id job.id
  json.jobId job.job_id
  json.currentValue job.current_value
  json.totalValue job.total_value
  json.done job.done
end

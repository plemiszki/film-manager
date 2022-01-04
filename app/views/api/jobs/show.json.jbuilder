json.job do
  json.id @job.id
  json.jobId @job.job_id
  json.firstLine @job.first_line
  json.secondLine @job.second_line
  json.currentValue @job.current_value
  json.totalValue @job.total_value
  json.errorsText @job.errors_text
  json.name @job.name
  json.done @job.done
  json.killed @job.killed
  json.status @job.status
end

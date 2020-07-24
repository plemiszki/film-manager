class GenerateAndSendCreditMemo
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(time_started, return_id)
    job = Job.find_by_job_id(time_started)
    dvd_return = Return.find(return_id)
    credit_memo = dvd_return.generate_credit_memo!
    # job_folder = "#{Rails.root}/tmp/#{time_started}"
    # FileUtils.mkdir_p("#{job_folder}")
    # TRY TO SEND
    job.update!({ done: true, current_value: credit_memo.id })
  end

end

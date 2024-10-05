class CreateStripeCustomer
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(time_started, email)
    job = Job.find_by_job_id(time_started)
    Stripe::Customer.create(email: email)

    stripe_id = ""
    until stripe_id.present?
      sleep 3
      stripe_id = StripeHelpers.fetch_stripe_id(email)
    end

    job.update!({
      status: :success,
      first_line: 'Stripe Customer Created',
      metadata: {
        stripe_id: stripe_id,
      }
    })
  end

end

class Email < ActiveRecord::Base

  enum(:status, [:pending, :delivered, :failed, :bounced])

  EMAIL_TYPES = %w[test statement].freeze

  belongs_to :sender, class_name: 'User'

  validates :email_type, presence: true, inclusion: { in: EMAIL_TYPES }
  validates :recipient, presence: true
  validates :subject, presence: true
  validates :mailgun_message_id, presence: true, uniqueness: true

  scope :statements, -> { where(email_type: 'statement') }
  scope :recent, -> { order(sent_at: :desc) }

  def mark_delivered!(timestamp = Time.current)
    update!(status: :delivered, delivered_at: timestamp)
  end

  def mark_failed!(error_message)
    update!(status: :failed, error_message: error_message)
  end

  def mark_bounced!(error_message)
    update!(status: :bounced, error_message: error_message)
  end

  def description
    email_type == "statement" ? "Statements - Q#{metadata["quarter"]} #{metadata["year"]}" : email_type.titleize
  end

end

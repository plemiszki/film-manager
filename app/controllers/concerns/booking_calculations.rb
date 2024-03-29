module BookingCalculations
  extend ActiveSupport::Concern

  def booking_calculations(booking)
    total_gross = calculate_total_gross(booking)
    valid, our_share = calculate_our_share(booking, total_gross)
    venue_share = valid ? calculate_venue_share(total_gross: total_gross, our_share: our_share, booking: booking) : 0
    received = calculate_received(booking)
    advance = booking.respond_to?(:advance) ? booking.advance : 0
    shipping_fee = booking.respond_to?(:shipping_fee) ? booking.shipping_fee : 0
    {
      valid: valid,
      total_gross: total_gross,
      our_share: our_share,
      venue_share: venue_share,
      received: received,
      owed: (our_share - received),
      overage: (our_share - advance - shipping_fee)
    }
  end

  def calculate_total_gross(booking)
    if booking.attributes["terms_change"]
      booking.weekly_box_offices.inject(0) { |total, weekly_box_office|  total + weekly_box_office.amount }
    else
      booking.box_office
    end
  end

  def calculate_received(booking)
    booking.payments.inject(0) { |total, payment|  total + payment.amount }
  end

  def calculate_our_share(booking, total_gross)
    if booking.attributes["terms_change"]
      valid = false
      our_share_total = 0.0
      weekly_terms = booking.weekly_terms.pluck(:terms)
      weekly_gross = booking.weekly_box_offices.pluck(:amount)
      booking.weekly_box_offices.each_with_index do |weekly_box_office, index|
        valid, our_share = calculate_share_from_terms(booking, weekly_terms[index], weekly_gross[index])
        break if !valid
        our_share_total += our_share
      end
    else
      terms = booking.terms.downcase
      valid, our_share_total = calculate_share_from_terms(booking, terms, total_gross)
    end
    our_share_total -= booking.deduction if deduct_from_our_share?(booking: booking)
    our_share_total = 0 if our_share_total < 0
    [valid, our_share_total]
  end

  def calculate_venue_share(total_gross:, our_share:, booking:)
    result = total_gross - our_share
    result -= booking.deduction unless deduct_from_our_share?(booking: booking)
    result
  end

  def deduct_from_our_share?(booking:)
    return true if booking.respond_to?(:shipping_fee) # if this is a non-virtual booking, deduct from our share
    return booking.host == "Venue"
  end

  def calculate_share_from_terms(booking, terms, gross)
    if !terms
      valid = false
      our_share = 0.0
    elsif terms == "90/10"
      valid = true
      our_share = (gross - booking.house_expense) * 0.9
    elsif terms.match(/^\$[\d\.]+ vs [\d\.]+%$/)
      valid = true
      match_data = terms.match(/^\$(?<flat>[\d\.]+) vs (?<percentage>[\d\.]+)%$/)
      flat = match_data[:flat].to_f
      percentage = match_data[:percentage].to_f * 0.01 * gross
      our_share = [flat, percentage].max + (booking.respond_to?(:shipping_fee) ? booking.shipping_fee : 0)
    elsif terms.match(/^[\d\.]+%$/)
      valid = true
      our_share = (terms.sub('%', '').to_f * 0.01 * gross) + (booking.respond_to?(:shipping_fee) ? booking.shipping_fee : 0)
    elsif terms.match(/^\$[\d\.]+$/)
      valid = true
      our_share = terms.sub('$', '').to_f + (booking.respond_to?(:shipping_fee) ? booking.shipping_fee : 0)
    else
      our_share = 0.0
      valid = false
    end
    [valid, our_share.round(2)]
  end

end

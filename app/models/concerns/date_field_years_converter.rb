module DateFieldYearsConverter

  extend ActiveSupport::Concern
  
  def convert_date_field_years
    fields = self.attributes.keys
    date_fields = fields.select { |field| self.type_for_attribute(field).type == :date }

    date_fields.each do |field|
      value = self.send(field)
      next unless value.present?
      next if value.is_a?(Array) # TODO: convert array columns
      day, month, year = value.day, value.month, value.year
      year += (year < 68 ? 2000 : 1900) if year.digits.length <= 2
      self.send("#{field}=", Date.parse("#{month}/#{day}/#{year}"))
    end
  end

  def end_date_not_before_start_date
    if start_date.present? && end_date.present? && end_date < start_date
      errors.add(:end_date, "cannot be before start date")
    end
  end

end
module Dollarify
  extend ActiveSupport::Concern

  include ActionView::Helpers::NumberHelper

  def dollarify(input)
    input = number_with_precision(input, precision: 2, delimiter: ',').to_s
    if (input[0] == '-')
      "($#{input[1..-1]})"
    else
      "$#{input}"
    end
  end

end

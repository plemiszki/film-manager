module ApplicationHelper

  def dollarify(input)
    input = number_with_precision(input, precision: 2, delimiter: ',').to_s
    input << '0' if input.split('.')[1].length < 2
    if (input[0] == '-')
      '-$' + input[1..-1]
    else
      '$' + input
    end
  end

end

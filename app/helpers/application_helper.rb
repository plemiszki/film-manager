module ApplicationHelper

  def dollarify(input)
    input << "0" if input.split('.')[1].length < 2
    if (input[0] == "-")
      '-$' + input[1..-1]
    else
      '$' + input
    end
  end

end

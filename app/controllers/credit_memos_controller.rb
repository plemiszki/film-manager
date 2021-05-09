class CreditMemosController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @credit_memo = CreditMemo.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

  def export
    credit_memo = CreditMemo.find(params[:id])
    directory = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p(directory)
    filename = "Credit Memo #{credit_memo.number}.pdf"
    path = "#{directory}/#{filename}"
    credit_memo.export(path)
    File.open(path, 'r') do |f|
      send_data f.read, filename: filename
    end
  end

end

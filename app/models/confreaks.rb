class Confreaks << ActiveRecord::Base
  
  def self.fetch
    html = File.read('/Users/priit/Sites/podcasts/spec/fixtures/confreaks.html')
    
    doc = Nokogiri::HTML(html)
    
    title = doc.search('#primary-content .video-title').text.strip
    
    authors = doc.search('#primary-content .video-presenters a').children.collect{ |c| c.text }.join(', ')
    
    description = doc.search('#primary-content .video-abstract').text.strip
    
    # assets = doc.search('#primary-content .video-details .assets .asset-box a')[1][:href]
    assets = doc.search('#primary-content .video-details .assets .asset-box a').select{ |a| a.text.include?('x720') }.first[:href]
    
    preview = doc.search('#primary-content .video-frame video').first[:poster]
    
    # video_href = video_doc.search('.assets a').select { |a| a.text.include?(size) }.first
    
    puts title.inspect
    puts authors.inspect
    puts description.inspect
    puts assets.inspect
    puts preview.inspect
  end
end


Confreaks.fetch
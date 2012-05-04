require 'open-uri'

class Confreaks

  def self.fetch(id)
    puts "Fetcing http://confreaks.com/videos/#{id}..."
    html = open("http://confreaks.com/videos/#{id}", 'User-Agent' => 'Confreaks podcast feed fetcher')
    
    content = Nokogiri::HTML(html).search('#primary-content')
    
    conference = content.search('h3').first.text.strip
    title = content.search('.video-title').text.strip
    authors = content.search('.video-presenters a').children.collect{ |c| c.text }.join(', ')
    description = content.search('.video-abstract').text.strip
    assets = content.search('.video-details .assets .asset-box a')
    asset = (assets.select{ |a| a[:href].include?('large.mp4') } + assets).first[:href]
    posted_on = content.search('.video-details .video-posted-on strong').text.strip
    
    podcast = Podcast.find_by_code('confreaks')
    podcast.podcast_items.create(
      :remote_id => id,
      :title => [[conference, authors].join(' - '), title].join(': '),
      :description => description,
      :guid => asset,
      :location => asset,
      :content_type => 'video/mp4',
      :published_at => (DateTime.parse(posted_on) rescue DateTime.now)
    )
  rescue
    puts "Could not fetch http://confreaks.com/videos/#{id}:"
  end
end

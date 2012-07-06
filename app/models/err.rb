require 'hpricot'
require 'open-uri'

class Err
  attr_accessor :title, :link, :image, :tracks, :playlist, :pub_date
  
  Podcasts = {
    :jazzitup => {:title => 'Jazzitup', :saade => '49', :bow => lambda { return Time.now.beginning_of_week - 86400 }, :image => '66'},
    :etnokonservid => {:title => 'Etnokonservid', :saade => '52', :bow => lambda { return Time.now.beginning_of_week - 86400 }, :image => '14'},
    :mustmesi => {:title => 'Must Mesi', :saade => '41', :bow => lambda {
      bow = Time.now.beginning_of_week + (3 * 86400)
      bow = Time.now.beginning_of_week - (4 * 86400) if (bow <=> Time.now) > 0
      return bow
    }, :image => '22'},
    :kajatuba => {:title => 'Kajatuba', :saade => '209', :bow => lambda {
      bow = Time.now.beginning_of_week + (3 * 86400)
      bow = Time.now.beginning_of_week - (4 * 86400) if (bow <=> Time.now) > 0
      return bow
    }, :image => '313'},
    :trammjabuss => {:title => 'Tramm ja buss', :saade => '22', :bow => lambda { return Time.now.beginning_of_week }, :image => '9'},
    :vibratsioon => {:title => 'Vibratsioon', :saade => '15', :bow => lambda {
      bow = Time.now.beginning_of_week + (3 * 86400)
      bow = Time.now.beginning_of_week - (4 * 86400) if (bow <=> Time.now) > 0
      return bow
    }, :image => '15'},
    :tallinnexpress => {:title => 'Tallinn Express', :saade => '17', :bow => lambda {
      bow = Time.now.beginning_of_week + (5 * 86400)
      bow = Time.now.beginning_of_week - (2 * 86400) if (bow <=> Time.now) > 0
      return bow
    }, :image => '17'},
    :leviosuti => {:title => 'Leviosuti', :saade => '186', :bow => lambda {
      bow = Time.now.beginning_of_week + (5 * 86400)
      bow = Time.now.beginning_of_week - (2 * 86400) if (bow <=> Time.now) > 0
      return bow
    }, :image => '112'},
    :kaabel => {:title => 'Kaabel', :saade => '185', :bow => lambda { return Time.now.beginning_of_week }, :image => '105'},
    :progressioon => {:title => 'Progressioon', :saade => '30', :bow => lambda { return Time.now.beginning_of_week }, :image => '46'},
    :eestipops => {:title => 'Eesti Pops', :saade => '284', :bow => lambda { return Time.now.beginning_of_week + 86400 }, :image => '202'},
    :londoncalling => {:title => 'London calling', :saade => '56', :bow => lambda {
      bow = Time.now.beginning_of_week + (5 * 86400)
      bow = Time.now.beginning_of_week - (2 * 86400) if (bow <=> Time.now) > 0
      return bow
    }, :image => '52'},
    :nestorjamorna => {:title => 'Nestor ja morna', :saade => '36', :bow => lambda {
      bow = Time.now.beginning_of_week + (1 * 86400)
      bow = Time.now.beginning_of_week - (6 * 86400) if (bow <=> Time.now) > 0
      return bow
    }, :image => '52'},
    :tjuunin => {:title => 'Tjuun In', :saade => '42', :bow => lambda {
      bow = Time.now.beginning_of_week + (4 * 86400)
      bow = Time.now.beginning_of_week - (3 * 86400) if (bow <=> Time.now) > 0
      return bow
    }, :image => '16'},
    :retro => {:title => 'Retro', :saade => '287', :bow => lambda {
      bow = Time.now.beginning_of_week + (5 * 86400)
      bow = Time.now.beginning_of_week - (2 * 86400) if (bow <=> Time.now) > 0
      return bow
    }, :image => '203'},
    :deepershadesofhouse => {:title => 'Deeper Shades of House', :saade => '210', :bow => lambda {
      bow = Time.now.beginning_of_week + (5 * 86400)
      bow = Time.now.beginning_of_week - (2 * 86400) if (bow <=> Time.now) > 0
      return bow
    }, :image => '203'}
  }
  
  def initialize(podcast)
    @p = Err::Podcasts[podcast.to_sym]
    @bow = @p[:bow].call
    @link = "http://www.r2.ee/saatelist?saade=#{@p[:saade]}"
    @image = "http://www.r2.ee/webimage10thumbshow?image_id=#{@p[:image]}"
    
    sources = open("http://www.r2.ee/player_jeroen?saade=#{@p[:saade]}&paev=#{@bow.strftime('%Y-%m-%d')}") { |f| Hpricot(f) }
    
    @tracks = Array.new
    
    (sources/'playlist/trackList/track').each do |track|
      @tracks << {
        :annotation => (track/'annotation').innerHTML,
        :location => (track/'location').innerHTML
      }
    end
    
    doc = open(@link) { |f| Hpricot(f) }
    @playlist = (doc/"#centercolumn p").to_html.gsub(/<br \/>/, "\n").gsub(/<\/?[^>]*>/, '').gsub(/[^\w\s\(\)-:]/, '').strip
  end
  
  def title
    @p[:title]
  end
  
  def link
    @link
  end
  
  def image
    @image
  end
  
  def tracks
    @tracks
  end
  
  def playlist
    @playlist
  end
  
  def pub_date
    @bow.rfc2822
  end
end
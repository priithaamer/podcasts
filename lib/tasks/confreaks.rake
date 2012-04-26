namespace :podcasts do
  namespace :confreaks do
    task :fetch => :environment do
    end
    
    task :fetch_range, [:from, :to] => :environment do |t, args|
      (args[:from].to_i..args[:to].to_i).each do |i|
        Confreaks.fetch(i)
        sleep 1
      end
    end
  end
end
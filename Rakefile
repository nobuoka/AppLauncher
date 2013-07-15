# encoding: utf-8

require 'pathname'

TSC = 'tsc'

task :default => [:build]

# 指定のディレクトリ (複数) の中にあるファイル全てを
# 別のディレクトリの中にコピーするためのタスクを定義する。
def setup_filecopy_task(taskname, obj_dir_path_str, src_dir_path_strs)
  obj_dir = Pathname.new(obj_dir_path_str)
  obj_file_path_strs = []
  src_dir_path_strs.each do |src_dir_path_str|
    src_dir_pathname = Pathname.new(src_dir_path_str)
    Pathname.glob(src_dir_pathname.to_s + '/**/*') do |pathname|
      src_str  = pathname.to_s
      dist     = obj_dir + pathname.relative_path_from(src_dir_pathname)
      dist_str = dist.to_s
      if pathname.extname == '.ts'
        # TODO ts ファイルが参照する外部スクリプトに対する依存関係も考慮する
        dist = dist.dirname.join(pathname.basename('.ts').to_s + '.js')
        dist_str = dist.to_s
        file dist_str => [ dist.dirname.to_s, src_str ] do |t|
          sh "#{TSC} --out #{t.name} #{t.prerequisites[1]}"
        end
      elsif pathname.directory?
        directory dist_str
      else
        file dist_str => [ dist.dirname.to_s, src_str ] do |t|
          cp src_str, t.name
        end
      end
      obj_file_path_strs << dist
    end
  end

  directory obj_dir_path_str
  task taskname => [ obj_dir.to_s ] + obj_file_path_strs
end

setup_filecopy_task(:build, 'obj', [ 'src' ])

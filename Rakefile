# encoding: utf-8

require 'pathname'

TSC = 'tsc'

task :default => [:build]

def check_ts_sourced_js(pathname)
  return false if pathname.extname != '.js'
  File.exist? pathname.dirname.join(pathname.basename('.js').to_s + '.ts')
end

# Check whether basename of itself or ancester directories starts with
# underscore character.
def include_underscore_name_in_descent?(pathname)
  pathname.descend do |pathname|
    return true if /\A_/ =~ pathname.basename.to_s
  end
  return false;
end

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
      if include_underscore_name_in_descent?(pathname)
        # Skip every file or directory whose name starts with underscore character
        dist = nil
      elsif pathname.extname == '.ts'
        if /\.d\.ts$/ =~ pathname.basename.to_s
          dist = nil
        else
          # TODO ts ファイルが参照する外部スクリプトに対する依存関係も考慮する
          js_filename_str = pathname.basename('.ts').to_s + '.js'
          src_js = pathname.dirname.join(js_filename_str)
          dst_js = dist.dirname.join(js_filename_str)
          file src_js.to_s => [ src_str ] do |t|
            sh "#{TSC} #{t.prerequisites[0]}"
          end
          file dst_js.to_s => [ dist.dirname.to_s, src_js.to_s ] do |t|
            cp t.prerequisites[1], t.name
          end
          dist = dst_js
        end
      elsif check_ts_sourced_js(pathname)
        # do nothing
      elsif pathname.directory?
        directory dist_str
      else
        file dist_str => [ dist.dirname.to_s, src_str ] do |t|
          cp src_str, t.name
        end
      end
      obj_file_path_strs << dist if dist
    end
  end

  directory obj_dir_path_str
  task taskname => [ obj_dir.to_s ] + obj_file_path_strs
end

setup_filecopy_task(:build, 'obj', [ 'src' ])

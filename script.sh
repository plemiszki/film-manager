for filename in ./flux/components/*; do
  count=0
  while read line; do
    if [ "$line" = "" ]; then
      echo $filename
      echo $count
      newcontents=$(gsed "$count a import FM from '../../app/assets/javascripts/me/common.jsx'" $filename)
      echo "$newcontents" > $filename
      break
    fi
    count=$(($count + 1))
  done < $filename
done

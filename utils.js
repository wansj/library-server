import moment from 'moment'

export const fmtPostDate = (issueAt) => {
  const iat = moment(issueAt)
  const weekAgo = moment().hour(0).minute(0).second(0).subtract(7, 'days')
  const twoDaysAgo = moment().hour(0).minute(0).second(0).subtract(1, 'days')
  // 今年以前，显示全称
  if (!iat.isSame(moment(), 'year')) {
    return iat.format('YYYY年M月D日 aHH:mm')
  } else if (iat.isBefore(weekAgo)) { //一周之前，省略年份
    return iat.format('M月D日 aHH:mm')
  } else if (iat.isBefore(twoDaysAgo)) { //两天之前，显示周几
    return iat.format('dddd HH:mm')
  } else if (iat.isSame(moment(), 'day')) { //如果是今天,只显示时间
    return iat.format('HH:mm')
  } else {
    return iat.format('昨天 HH:mm')
  }
}
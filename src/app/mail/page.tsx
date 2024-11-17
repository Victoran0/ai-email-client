import React from 'react'
import Mail from './mail'

const MailDashboard = () => {
    return (
        <Mail
            defaultLayout={[20,32,40]}
            defaultCollapsed={false}
            navCollapsedSize={4}
        />
    )
}

export default MailDashboard

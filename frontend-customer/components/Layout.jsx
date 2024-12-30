import React from 'react'
import Header from './Header'
import Footer from './Footer'
import ChatbotButton from './ChatButton'

const Layout = ({ children }) => {
	return (
		<div>
			<Header />
			<div className="cont">
				{children}
			</div>
			<ChatbotButton />
			<Footer />
		</div>
	)
}

export default Layout
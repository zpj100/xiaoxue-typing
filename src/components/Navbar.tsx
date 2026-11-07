import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link, NavLink } from 'react-router-dom'

export default function Navigation() {
  return (
    <Navbar expand="lg" className="site-nav sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          小学打字训练营
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto gap-lg-2">
            <Nav.Link as={NavLink} to="/" end>
              首页
            </Nav.Link>
            <Nav.Link as={NavLink} to="/chinese">
              语文
            </Nav.Link>
            <Nav.Link as={NavLink} to="/english">
              英语
            </Nav.Link>
            <Nav.Link as={NavLink} to="/progress">
              进度
            </Nav.Link>
            <Nav.Link as={NavLink} to="/wrongbook">
              错词本
            </Nav.Link>
            <Nav.Link as={NavLink} to="/about">
              关于
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

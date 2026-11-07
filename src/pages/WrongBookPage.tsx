import { Badge, Container, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { clearWrongBook, loadWrongBook, removeWrong } from '../lib/wrongbook'
import { useState } from 'react'

export default function WrongBookPage() {
  const [list, setList] = useState(loadWrongBook)

  function refresh() {
    setList(loadWrongBook())
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h1 className="display-font mb-0">错词本</h1>
        <div className="d-flex gap-2">
          <Link className="btn btn-primary" to="/play/wrongbook/recall">
            默写错词
          </Link>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              clearWrongBook()
              refresh()
            }}
            disabled={list.length === 0}
          >
            清空
          </button>
        </div>
      </div>
      <p className="text-secondary">打错会自动收进来。仿 TypeWords / typing-word：错词反复练到打对。</p>
      {list.length === 0 ? (
        <div className="arena-card p-4">还没有错词。去跟打或默写里打错一次就会出现。</div>
      ) : (
        <div className="table-responsive arena-card p-3">
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th>题目</th>
                <th>答案</th>
                <th>错次</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.item.id}>
                  <td>
                    {row.item.prompt}
                    <div className="small text-secondary">{row.item.hint}</div>
                  </td>
                  <td>
                    {row.item.answer}
                    {row.item.phonetic ? <div className="small text-primary">{row.item.phonetic}</div> : null}
                  </td>
                  <td>
                    <Badge bg="danger">{row.count}</Badge>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => {
                        removeWrong(row.item.id)
                        refresh()
                      }}
                    >
                      移出
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  )
}
